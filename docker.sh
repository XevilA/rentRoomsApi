docker run -d \
  --name node_api2 \
  -p 3002:3001 \
  -e DB_USER=postgres \
  -e DB_PASSWORD=root \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=roomdb \
  node_api
