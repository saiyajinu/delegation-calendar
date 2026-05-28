import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function day(year: number, month: number, dayOfMonth: number) {
  return new Date(year, month - 1, dayOfMonth);
}

async function main() {
  await prisma.activity.deleteMany();
  await prisma.businessTrip.deleteMany();

  await prisma.businessTrip.create({
    data: {
      title: "Client workshop",
      city: "Berlin",
      startDate: day(2026, 5, 26),
      endDate: day(2026, 5, 30),
      notes: "Flight BA 123 · Hotel Adlon",
    },
  });

  await prisma.businessTrip.create({
    data: {
      title: "Conference",
      city: "Amsterdam",
      startDate: day(2026, 6, 10),
      endDate: day(2026, 6, 12),
      notes: "Keynote on Tuesday morning",
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        title: "Quarterly planning",
        description: "Reviewed OKRs with the team",
        date: day(2026, 5, 27),
      },
      {
        title: "Client dinner",
        description: "Met stakeholders at the hotel restaurant",
        date: day(2026, 5, 28),
      },
      {
        title: "Workshop facilitation",
        date: day(2026, 5, 29),
      },
      {
        title: "Gym session",
        date: day(2026, 5, 20),
      },
      {
        title: "Blog draft",
        description: "Outlined post on delegation patterns",
        date: day(2026, 6, 9),
      },
    ],
  });

  console.log("Seed data created.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
