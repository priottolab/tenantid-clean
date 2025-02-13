const { MongoClient, ObjectId } = require("mongodb");

async function fetchDataFromAllCollections() {
  const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017";
  const dbName = process.env.MONGO_DB || "seu_banco";
  let tenantFilter = process.env.TENANT_ID || "";
  const deleteEnabled = process.env.DELETE === "TRUE"; // Por padrão, é FALSE

  // Verifique se TENANT_ID é um ObjectId válido e converta, caso contrário, use string vazia
  if (tenantFilter) {
    tenantFilter = ObjectId.isValid(tenantFilter) ? new ObjectId(tenantFilter) : "";
  }

  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log("\n🔹 Buscando dados das coleções específicas...");
    
    // Coleções fixas (sem filtro se TENANT_ID estiver vazio)
    const predefinedQueries = [
      { collection: "companies", projection: { _id: 1, name: 1, identifier: 1, tenant: 1, economicGroup: 1 } },
      { collection: "tenants", projection: { _id: 1, name: 1 } },
      { collection: "economicgroups", projection: { _id: 1, name: 1 } }
    ];

    for (const query of predefinedQueries) {
      const filter = tenantFilter ? { tenant: tenantFilter } : {};
      console.log(`\n📂 Coleção: ${query.collection} (filtro: ${tenantFilter ? JSON.stringify(filter) : "SEM FILTRO"})`);

      const data = await db.collection(query.collection).find(filter, { projection: query.projection }).toArray();
      console.log(data.length ? data : "⚠️ Nenhum documento encontrado.");
    }

    // Se TENANT_ID estiver definido, consultar todas as coleções dinamicamente
    if (tenantFilter) {
      console.log("\n🔹 Listando todas as coleções do banco...");

      const collections = await db.listCollections().toArray();
      const collectionStats = [];

      for (const collection of collections) {
        const collectionName = collection.name;
        console.log(`\n📂 Consultando coleção: ${collectionName} (filtro: ${JSON.stringify({ tenant: tenantFilter })})`);

        // Aplicar filtro de tenant a todas as coleções dinâmicas
        const filter = { tenant: tenantFilter };
        const documents = await db.collection(collectionName).find(filter, { projection: { _id: 1, name: 1 } }).toArray();
        console.log(documents.length ? documents : "⚠️ Nenhum documento encontrado.");

        // Adicionar à lista de estatísticas
        collectionStats.push({ collection: collectionName, count: documents.length });

        // Se delete estiver ativado, excluir os documentos filtrados
        if (deleteEnabled && documents.length > 0) {
          const deleteResult = await db.collection(collectionName).deleteMany(filter);
          console.log(`🗑️ ${deleteResult.deletedCount} documentos deletados da coleção ${collectionName}`);
        }
      }

      // Mostrar resumo final de quantos documentos cada coleção tem
      console.log("\n📊 Resumo de documentos por coleção:");
      collectionStats.forEach(stat => {
        console.log(`📂 ${stat.collection}: ${stat.count} documentos encontrados`);
      });
    }

  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await client.close();
  }
}

fetchDataFromAllCollections();
