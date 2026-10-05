/**
 * Seed de VetLab — `npm run seed`
 *
 * Idempotente: vacía las 5 colecciones, inserta datos de demo y recrea índices.
 * Crea su propio MongoClient (lib/db.ts es server-only y no puede importarse acá).
 * Las citas se generan relativas a "hoy" en America/Montevideo, validadas con la
 * misma lógica de solapamiento de la app (lib/availability.ts).
 */
import { MongoClient, ObjectId } from "mongodb";
import {
  appointmentInterval,
  fitsIn,
  localToUtc,
  overlaps,
  subtract,
  workingIntervals,
  type Interval,
} from "../src/lib/availability";
import { CLINIC_TZ, SLOT_STEP_MIN } from "../src/lib/config";
import { todayISO } from "../src/lib/datetime";
import type { Appointment } from "../src/lib/models/appointment";
import type { Owner } from "../src/lib/models/owner";
import type { Pet } from "../src/lib/models/pet";
import type { Service } from "../src/lib/models/service";
import type { EstadoCita, Horarios } from "../src/lib/models/shared";
import type { Vet } from "../src/lib/models/vet";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const MIN = 60_000;

// RNG determinista (mulberry32) para un seed reproducible.
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20261005);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

function addDaysISO(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

const SERVICES: Omit<Service, "_id">[] = [
  { slug: "consulta-general", nombre: "Consulta general", descripcion: "Consulta clínica general.", duracionMin: 30, precio: 1200 },
  { slug: "vacunacion", nombre: "Vacunación", descripcion: "Aplicación de vacunas y refuerzos.", duracionMin: 20, precio: 900 },
  { slug: "control", nombre: "Control", descripcion: "Control de rutina y seguimiento.", duracionMin: 30, precio: 800 },
  { slug: "peluqueria", nombre: "Peluquería", descripcion: "Corte, baño y arreglo.", duracionMin: 60, precio: 1500 },
  { slug: "cirugia", nombre: "Cirugía menor", descripcion: "Procedimientos quirúrgicos menores.", duracionMin: 90, precio: 6500 },
];

const HORARIOS_LUCIA: Horarios = {
  lun: [{ desde: "09:00", hasta: "13:00" }, { desde: "15:00", hasta: "19:00" }],
  mar: [{ desde: "09:00", hasta: "13:00" }, { desde: "15:00", hasta: "19:00" }],
  mie: [{ desde: "09:00", hasta: "13:00" }, { desde: "15:00", hasta: "19:00" }],
  jue: [{ desde: "09:00", hasta: "13:00" }, { desde: "15:00", hasta: "19:00" }],
  vie: [{ desde: "09:00", hasta: "13:00" }, { desde: "15:00", hasta: "19:00" }],
  sab: [{ desde: "09:00", hasta: "12:00" }],
};
const HORARIOS_MARTIN: Horarios = {
  lun: [{ desde: "08:00", hasta: "14:00" }],
  mie: [{ desde: "08:00", hasta: "14:00" }],
  vie: [{ desde: "08:00", hasta: "14:00" }],
};
const HORARIOS_VALENTINA: Horarios = {
  mar: [{ desde: "10:00", hasta: "13:00" }, { desde: "14:00", hasta: "18:00" }],
  jue: [{ desde: "10:00", hasta: "13:00" }, { desde: "14:00", hasta: "18:00" }],
  sab: [{ desde: "09:00", hasta: "13:00" }],
};

const VETS: Omit<Vet, "_id">[] = [
  {
    nombre: "Dra. Lucía Fernández",
    especialidad: "Medicina general",
    bio: "Clínica médica de pequeños animales. Diez años de experiencia en atención primaria.",
    fotoUrl: "/vets/lucia.svg",
    horarios: HORARIOS_LUCIA,
  },
  {
    nombre: "Dr. Martín Pereira",
    especialidad: "Cirugía",
    bio: "Cirujano de tejidos blandos. Referente interno para procedimientos menores.",
    fotoUrl: "/vets/martin.svg",
    horarios: HORARIOS_MARTIN,
  },
  {
    nombre: "Dra. Valentina Rocha",
    especialidad: "Dermatología y estética",
    bio: "Dermatología veterinaria y peluquería clínica. Sin foto: ejercita el avatar de iniciales.",
    horarios: HORARIOS_VALENTINA,
  },
];

const OWNERS: Omit<Owner, "_id">[] = [
  { nombre: "María", apellido: "González", email: "maria.gonzalez@example.com", telefono: "099 123 456", direccion: "Av. Italia 1234", createdAt: new Date() },
  { nombre: "Juan", apellido: "Techera", email: "juan.techera@example.com", telefono: "098 234 567", createdAt: new Date() },
  { nombre: "Ana", apellido: "Silva", email: "ana.silva@example.com", telefono: "097 345 678", direccion: "Rivera 456", createdAt: new Date() },
  { nombre: "Carlos", apellido: "Rodríguez", email: "carlos.rodriguez@example.com", telefono: "094 456 789", createdAt: new Date() },
  { nombre: "Sofía", apellido: "Martínez", email: "sofia.martinez@example.com", telefono: "095 567 890", direccion: "Bvar. Artigas 789", createdAt: new Date() },
  { nombre: "Diego", apellido: "Acosta", email: "diego.acosta@example.com", telefono: "093 678 901", createdAt: new Date() },
  { nombre: "Camila", apellido: "Núñez", email: "camila.nunez@example.com", telefono: "092 789 012", direccion: "8 de Octubre 2020", createdAt: new Date() },
];

// [ownerIndex, nombre, especie, raza?, extra?]
const PETS: [number, string, Pet["especie"], string?, Partial<Pet>?][] = [
  [0, "Luna", "perro", "Labrador", { fechaNacimiento: new Date("2021-03-15"), pesoKg: 28, notas: "Mansa, le teme al secador." }],
  [0, "Michi", "gato", "Común europeo", { pesoKg: 4.2 }],
  [1, "Rocky", "perro", "Bulldog", { fechaNacimiento: new Date("2019-07-01"), pesoKg: 24, notas: "Braquicefálico: vigilar respiración." }],
  [2, "Nala", "gato", "Siamés", { fechaNacimiento: new Date("2022-11-20") }],
  [2, "Coco", "ave", "Canario", { notas: "Traer en jaula tapada." }],
  [3, "Bruno", "perro", "Mestizo", { pesoKg: 18 }],
  [4, "Pelusa", "roedor", "Hámster", {}],
  [5, "Simón", "perro", "Caniche", { fechaNacimiento: new Date("2020-05-10"), pesoKg: 7 }],
  [6, "Kiwi", "reptil", "Tortuga", { notas: "Revisión anual de caparazón." }],
];

const MOTIVOS = [
  "Control anual", "Vacuna antirrábica", "Decaida y poco apetito", "Corte y baño",
  "Revisión de piel", "Control post-cirugía", "Cojera leve", "Desparasitación",
  "Limpieza dental", "Chequeo general",
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("vetlab");

  // Idempotente: vaciar las colecciones antes de insertar.
  for (const name of ["owners", "pets", "vets", "services", "appointments"]) {
    await db.collection(name).deleteMany({});
  }

  const services: Service[] = SERVICES.map((s) => ({ ...s, _id: new ObjectId(), activo: true }));
  const vets: Vet[] = VETS.map((v) => ({ ...v, _id: new ObjectId() }));
  const owners: Owner[] = OWNERS.map((o) => ({ ...o, _id: new ObjectId() }));
  const pets: Pet[] = PETS.map(([ownerIdx, nombre, especie, raza, extra]) => ({
    _id: new ObjectId(),
    ownerId: owners[ownerIdx]._id,
    nombre,
    especie,
    ...(raza ? { raza } : {}),
    ...extra,
  }));
  const petsByOwner = new Map<string, Pet[]>();
  for (const p of pets) {
    const k = p.ownerId.toHexString();
    petsByOwner.set(k, [...(petsByOwner.get(k) ?? []), p]);
  }

  // Próximo día laborable desde hoy (ningún vet atiende domingos).
  const hoy = todayISO(CLINIC_TZ);
  let diaPrincipal = hoy;
  while (vets.every((v) => workingIntervals(v.horarios, diaPrincipal).length === 0)) {
    diaPrincipal = addDaysISO(diaPrincipal, 1);
  }
  if (diaPrincipal !== hoy) {
    console.log(`Hoy (${hoy}) no atiende ningún vet: se usa ${diaPrincipal} como "día principal".`);
  }

  const appointments: Appointment[] = [];
  const busyPorVetDia = new Map<string, Interval[]>(); // `${vetId}|${dateISO}` → ocupados (activos)

  function busyDe(vet: Vet, dia: string): Interval[] {
    const k = `${vet._id.toHexString()}|${dia}`;
    if (!busyPorVetDia.has(k)) busyPorVetDia.set(k, []);
    return busyPorVetDia.get(k)!;
  }

  function agregarCita(
    vet: Vet, dia: string, inicioUtc: Date, service: Service, estado: EstadoCita,
  ): void {
    const pet = pick(pets);
    const owner = owners.find((o) => o._id.equals(pet.ownerId))!;
    const createdAt = new Date(inicioUtc.getTime() - (1 + Math.floor(rand() * 72)) * 3600_000);
    appointments.push({
      _id: new ObjectId(),
      ownerId: owner._id,
      petId: pet._id,
      vetId: vet._id,
      serviceId: service._id,
      fechaHora: inicioUtc,
      motivo: rand() < 0.8 ? pick(MOTIVOS) : undefined,
      estado,
      notas: rand() < 0.25 ? "Cargada por recepción." : undefined,
      createdAt,
    });
    if (estado !== "cancelada") {
      busyDe(vet, dia).push(appointmentInterval(inicioUtc, service.duracionMin));
    }
  }

  /** Coloca `target` citas activas en la grilla de SLOT_STEP_MIN dentro del horario del vet. */
  function colocarCitas(vet: Vet, dia: string, esPasado: boolean, target: number): void {
    const working = workingIntervals(vet.horarios, dia);
    if (working.length === 0) return;

    // Candidatos: inicios en grilla de 15' dentro de cada franja.
    const inicios: Date[] = [];
    for (const f of working) {
      for (let t = f.start.getTime(); t <= f.end.getTime() - 15 * MIN; t += SLOT_STEP_MIN * MIN) {
        inicios.push(new Date(t));
      }
    }
    // Recorrido pseudoaleatorio pero determinista.
    const orden = [...inicios].sort(() => rand() - 0.5);

    let colocadas = 0;
    for (const inicio of orden) {
      if (colocadas >= target) break;
      const service = pick(services);
      const candidato = appointmentInterval(inicio, service.duracionMin);
      const libres = subtract(working, busyDe(vet, dia));
      if (!fitsIn(libres, candidato)) continue; // no entra: se solapa o sale del horario

      const estado: EstadoCita = esPasado
        ? rand() < 0.85 ? "completada" : "cancelada"
        : rand() < 0.55 ? "confirmada" : "pendiente";
      agregarCita(vet, dia, inicio, service, estado);
      colocadas++;
    }
  }

  // Citas de hoy−3 a hoy+4 para cada vet que atienda ese día.
  for (let off = -3; off <= 4; off++) {
    const dia = addDaysISO(hoy, off);
    for (const vet of vets) {
      if (workingIntervals(vet.horarios, dia).length === 0) continue;
      const esPasado = dia < diaPrincipal;
      const target = dia === diaPrincipal ? 2 + Math.floor(rand() * 2) : 1 + Math.floor(rand() * 3);
      colocarCitas(vet, dia, esPasado, target);
    }
  }

  // Garantía: al menos 6 citas el "día principal" (hoy o el próximo día hábil).
  const enPrincipal = () => {
    const { start, end } = { start: localToUtc(diaPrincipal, "00:00"), end: localToUtc(diaPrincipal, "24:00") };
    return appointments.filter((a) => a.fechaHora >= start && a.fechaHora < end).length;
  };
  for (const vet of vets) {
    while (enPrincipal() < 6) colocarCitas(vet, diaPrincipal, false, 1);
  }

  // 2 canceladas futuras en slots libres: evidencian que cancelar libera el hueco.
  let canceladasFuturas = 0;
  for (let off = 1; off <= 4 && canceladasFuturas < 2; off++) {
    const dia = addDaysISO(hoy, off);
    for (const vet of vets) {
      if (canceladasFuturas >= 2) break;
      const working = workingIntervals(vet.horarios, dia);
      if (working.length === 0) continue;
      const libres = subtract(working, busyDe(vet, dia));
      for (const f of libres) {
        if (canceladasFuturas >= 2) break;
        const service = pick(services);
        const inicio = f.start;
        const candidato = appointmentInterval(inicio, service.duracionMin);
        // Una cancelada no ocupa lugar: solo pedimos que el hueco sea válido en el horario.
        const enHorario = working.some((w) => w.start <= candidato.start && candidato.end <= w.end);
        const sinChoque = busyDe(vet, dia).every((b) => !overlaps(b, candidato));
        if (enHorario && sinChoque) {
          agregarCita(vet, dia, inicio, service, "cancelada");
          canceladasFuturas++;
        }
      }
    }
  }

  await db.collection<Service>("services").insertMany(services);
  await db.collection<Vet>("vets").insertMany(vets);
  await db.collection<Owner>("owners").insertMany(owners);
  await db.collection<Pet>("pets").insertMany(pets);
  await db.collection<Appointment>("appointments").insertMany(appointments);

  // Índices (spec §1.3).
  await db.collection("owners").createIndex({ email: 1 }, { unique: true });
  await db.collection("owners").createIndex(
    { nombre: "text", apellido: "text", email: "text", telefono: "text" },
    { name: "owners_text" },
  );
  await db.collection("pets").createIndex({ ownerId: 1 });
  await db.collection("services").createIndex({ slug: 1 }, { unique: true });
  await db.collection("appointments").createIndex({ vetId: 1, fechaHora: 1 });
  await db.collection("appointments").createIndex({ fechaHora: 1 });
  await db.collection("appointments").createIndex({ ownerId: 1 });

  console.log("Seed OK:", {
    services: services.length,
    vets: vets.length,
    owners: owners.length,
    pets: pets.length,
    appointments: appointments.length,
    hoy: `${hoy} (${appointments.filter((a) => {
      const { start, end } = { start: localToUtc(hoy, "00:00"), end: localToUtc(hoy, "24:00") };
      return a.fechaHora >= start && a.fechaHora < end;
    }).length} citas hoy)`,
    diaPrincipal: `${diaPrincipal} (${enPrincipal()} citas)`,
    canceladasFuturas,
  });

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
