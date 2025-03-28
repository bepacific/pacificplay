# AirtableDataHub

An application that connects to Airtable and provides data based on email queries.

## Docker Setup

### Prerequisites
- Docker installed on your system
- Airtable API key, Base ID, and Table Name

### Building the Docker Image

```bash
docker build -t airtable-data-hub .
```

### Running the Docker Container

```bash
docker run -p 5000:5000 \
  -e AIRTABLE_API_KEY=your_api_key_here \
  -e AIRTABLE_BASE_ID=your_base_id_here \
  -e AIRTABLE_TABLE_NAME=your_table_name_here \
  airtable-data-hub
```

Replace `your_api_key_here`, `your_base_id_here`, and `your_table_name_here` with your actual Airtable credentials.

You can also use a .env file:

```bash
docker run -p 5000:5000 --env-file .env airtable-data-hub
```

### Accessing the Application

Once the container is running, you can access the application at:

```
http://localhost:5000
```

## Development

### Installing Dependencies

```bash
npm install
```

### Running in Development Mode

```bash
npm run dev
```

### Building the Application

```bash
npm run build
```

### Running in Production Mode

```bash
npm start
``` 