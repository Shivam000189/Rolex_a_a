import process from "process";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const FIRST_NAMES = [
  "Alexander", "Christopher", "Maximilian", "Jonathan", "Bartholomew",
  "Sebastian", "Benjamin", "Archibald", "Theodore", "Nathaniel",
  "Elizabeth", "Victoria", "Genevieve", "Cassandra", "Bernadette",
  "Jacqueline", "Alexandria", "Guinevere", "Evangeline", "Penelope",
  "Dominic", "Harrison", "Ferdinand", "Montgomery", "Salvatore",
  "Constance", "Henrietta", "Wilhelmina", "Clementine", "Seraphina"
];

const LAST_NAMES = [
  "Montgomery-Smith", "Kensington-Cross", "Fitzgerald-Hayes", "Vanderbilt-Cole",
  "Livingston-Brooks", "Harrington-Welles", "Pembroke-Shields", "Wellington-Price",
  "Ashford-Delaney", "Blackwood-Sinclair", "Sinclair-Sterling", "Holloway-Mercer",
  "Beaumont-Rivers", "Carrington-Vance", "Stratford-Browning", "Huntington-Pearce",
  "Fairchild-Winslow", "Kingsley-Barrett", "Prescott-Vanguard", "Thornton-Summers"
];

const STORE_PREFIXES = [
  "Apex", "Nova", "Summit", "Echo", "Zenith", "Beacon", "Pinnacle", "Velvet",
  "Radiant", "Aurora", "Sapphire", "Grand", "Metro", "Sterling", "Horizon", "Crown",
  "Rustic", "Opal", "Heritage", "Paramount", "Crystal", "Lumina", "Solace", "Nexus",
  "Urban", "Prime", "Elite", "Vintage", "Golden", "Terra"
];

const STORE_TYPES = [
  "Coffee", "Bakery", "Books", "Electronics", "Apparel", "Foods",
  "Living", "Fitness", "Wellness", "Jewelry", "Floral", "Pet Care",
  "Wine Cellar", "Ice Cream", "Mobility", "Outdoors", "Lighting", "Eyewear",
  "Leather Goods", "Stationery"
];

const STREET_NAMES = [
  "Grand Avenue", "Lexington Boulevard", "Highland Parkway", "Market Street",
  "Oakridge Way", "Riverside Drive", "Beacon Hill Road", "Commerce Square",
  "Kingsway Promenade", "Sunset Strip", "Broadway Center", "Industrial Park Way",
  "Harbor View Drive", "Maple Crest Way", "Victoria Boulevard", "Cedar Hill Road"
];

const CITIES = [
  { city: "New York", state: "NY", zip: "10001" },
  { city: "San Francisco", state: "CA", zip: "94105" },
  { city: "Austin", state: "TX", zip: "78701" },
  { city: "Chicago", state: "IL", zip: "60601" },
  { city: "Seattle", state: "WA", zip: "98101" },
  { city: "Boston", state: "MA", zip: "02108" },
  { city: "Denver", state: "CO", zip: "80202" },
  { city: "Atlanta", state: "GA", zip: "30303" },
  { city: "Miami", state: "FL", zip: "33101" },
  { city: "Portland", state: "OR", zip: "97201" }
];

function generateFullName(index: number): string {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[index % LAST_NAMES.length];
  const suffix = ` (Partner ${String(index + 1).padStart(3, "0")})`;
  let name = `${first} ${last}${suffix}`;
  if (name.length < 20) {
    name = `${name} Account`;
  }
  if (name.length > 60) {
    name = name.slice(0, 60);
  }
  return name;
}

function generateAddress(index: number): string {
  const streetNum = (index * 37 + 101) % 9999 + 1;
  const street = STREET_NAMES[index % STREET_NAMES.length];
  const location = CITIES[index % CITIES.length];
  return `${streetNum} ${street}, Suite ${100 + (index % 50)}, ${location.city}, ${location.state} ${location.zip}`;
}

async function main() {
  console.log("[SEED] Starting database seed...");

  // 1. Clean existing database tables
  console.log("[SEED] Clearing old data...");
  await prisma.rating.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash("Password@1234", 10);
  const adminPasswordHash = await bcrypt.hash("Admin@1234", 10);
  const storePasswordHash = await bcrypt.hash("Store@1234", 10);
  const userPasswordHash = await bcrypt.hash("User@1234", 10);

  // 2. Create Administrator Account
  console.log("[SEED] Creating Admin account...");
  const adminUser = await prisma.user.create({
    data: {
      name: "System Administrator Officer",
      email: "admin@roxil.com",
      password: adminPasswordHash,
      address: "742 Evergreen Terrace, Springfield, IL 62704, United States",
      role: UserRole.ADMIN,
    },
  });

  // 3. Create Main Featured Store Owner & Store
  console.log("[SEED] Creating Main Store Owner and Store...");
  const mainStoreOwner = await prisma.user.create({
    data: {
      name: "Primary Store Owner Account",
      email: "storeowner@roxil.com",
      password: storePasswordHash,
      address: "100 Market Square, Suite 400, San Francisco, CA 94103, USA",
      role: UserRole.STORE_OWNER,
    },
  });

  const mainStore = await prisma.store.create({
    data: {
      name: "Roxil Flagship Store",
      email: "flagship@roxil.com",
      address: "100 Market Square, Suite 400, San Francisco, CA 94103, USA",
      rating: 4.8,
      ownerId: mainStoreOwner.id,
    },
  });

  // 4. Create Standard Normal User Account
  console.log("[SEED] Creating Normal User account...");
  const mainNormalUser = await prisma.user.create({
    data: {
      name: "Standard Normal User Account",
      email: "user@roxil.com",
      password: userPasswordHash,
      address: "456 Elm Street, Apt 7B, New York, NY 10001, USA",
      role: UserRole.USER,
    },
  });

  // 5. Create 30 Additional Normal Users for generating realistic ratings
  console.log("[SEED] Creating 30 customer accounts for rating distribution...");
  const ratingUsers = [mainNormalUser];
  for (let i = 1; i <= 30; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Verified Customer User ${String(i).padStart(2, "0")} Profile`,
        email: `customer${i}@example.com`,
        password: defaultPasswordHash,
        address: generateAddress(i + 500),
        role: UserRole.USER,
      },
    });
    ratingUsers.push(user);
  }

  // 6. Create 200 Fake Store Owners and 200 Stores
  console.log("[SEED] Creating 200 Store Owners and 200 Stores...");
  const createdStores = [mainStore];

  for (let i = 0; i < 200; i++) {
    const ownerName = generateFullName(i);
    const ownerEmail = `storeowner${i + 1}@roxilshops.com`;
    const storeAddress = generateAddress(i);

    const prefix = STORE_PREFIXES[i % STORE_PREFIXES.length];
    const type = STORE_TYPES[Math.floor(i / STORE_PREFIXES.length) % STORE_TYPES.length];
    const storeName = `${prefix} ${type} #${i + 1}`;
    const storeEmail = `contact.store${i + 1}@roxilshops.com`;

    const owner = await prisma.user.create({
      data: {
        name: ownerName,
        email: ownerEmail,
        password: defaultPasswordHash,
        address: storeAddress,
        role: UserRole.STORE_OWNER,
      },
    });

    const store = await prisma.store.create({
      data: {
        name: storeName,
        email: storeEmail,
        address: storeAddress,
        rating: 0,
        ownerId: owner.id,
      },
    });

    createdStores.push(store);

    if ((i + 1) % 50 === 0) {
      console.log(`  [SEED] Generated ${i + 1} / 200 stores...`);
    }
  }

  // 7. Generate Diverse Ratings for Stores
  console.log("[SEED] Generating ratings and calculating store averages...");
  let ratingCount = 0;

  for (const store of createdStores) {
    const numRatings = Math.floor(Math.random() * 5) + 2;
    const shuffledUsers = [...ratingUsers].sort(() => 0.5 - Math.random());
    const selectedUsers = shuffledUsers.slice(0, numRatings);

    let sum = 0;
    for (const user of selectedUsers) {
      const weights = [1, 2, 3, 4, 4, 5, 5, 5];
      const ratingValue = weights[Math.floor(Math.random() * weights.length)];
      sum += ratingValue;

      await prisma.rating.create({
        data: {
          userId: user.id,
          storeId: store.id,
          value: ratingValue,
        },
      });
      ratingCount++;
    }

    const averageRating = Number((sum / numRatings).toFixed(1));
    await prisma.store.update({
      where: { id: store.id },
      data: { rating: averageRating },
    });
  }

  console.log(`\n[SEED] Completed successfully.`);
  console.log(`=========================================`);
  console.log(`Total Users Created:  ${await prisma.user.count()}`);
  console.log(`Total Stores Created: ${await prisma.store.count()}`);
  console.log(`Total Ratings Added:  ${ratingCount}`);
  console.log(`=========================================`);
  console.log(`LOGIN CREDENTIALS:`);
  console.log(`-----------------------------------------`);
  console.log(`1. Admin Account:`);
  console.log(`   Email:    admin@roxil.com`);
  console.log(`   Password: Admin@1234`);
  console.log(`   Role:     ADMIN`);
  console.log(`-----------------------------------------`);
  console.log(`2. Store Owner Account:`);
  console.log(`   Email:    storeowner@roxil.com`);
  console.log(`   Password: Store@1234`);
  console.log(`   Role:     STORE_OWNER`);
  console.log(`   Store:    Roxil Flagship Store`);
  console.log(`-----------------------------------------`);
  console.log(`3. Normal User Account:`);
  console.log(`   Email:    user@roxil.com`);
  console.log(`   Password: User@1234`);
  console.log(`   Role:     USER`);
  console.log(`=========================================`);
}

main()
  .catch((e) => {
    console.error("[SEED] Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
