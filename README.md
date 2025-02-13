# BUILD

```
docker build -t tenantid-clean .
```

# LIST BASE INFO COLLECTIONS

```
docker run --rm --name script -e MONGO_URL="mongodb+srv://user:password@server:port/?retryWrites=true&w=majority&appName=appanme" -e MONGO_DB="database" tenantid-clean
```

# LIST BASE INFO COLLECTIONS FILTERING BY TENANT_ID

```
docker run --rm --name script -e MONGO_URL="mongodb+srv://user:password@server:port/?retryWrites=true&w=majority&appName=appanme" -e MONGO_DB="database" -e TENANT_ID="tenant-id" tenantid-clean
```
# DELETE ALL DOC BASED ON THE TENANT_ID

```
docker run --rm --name script -e MONGO_URL="mongodb+srv://user:password@server:port/?retryWrites=true&w=majority&appName=appanme" -e MONGO_DB="database" -e TENANT_ID="tenant_id" -e DELETE=true tenantid-clean
```
