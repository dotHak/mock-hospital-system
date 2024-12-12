# Mock Hospital System Documentation

## Overview

The **Mock Hospital System** is a prototype application developed to simulate hospital services for testing and development. Built using **HonoJS**, **SQLite**, and **Drizzle**, the system provides APIs for managing hospital data, such as doctors, services, and appointments.

The system is designed for efficient deployment and scalability while leveraging modern tools for seamless integration and management.

---

## Features

- RESTful APIs for hospital data management.
- SQLite for lightweight, reliable database storage.
- Drizzle ORM for schema definition and migrations.
- Environment-variable configuration for flexible deployment.
- Cloud-ready with support for Turso and AWS.
- Comprehensive API documentation deployed with Scalar and OpenAPI.

---

## Getting Started

### Prerequisites

Ensure the following tools are installed and set up on your system:

1. **Node.js**: v20.0.0 or later ([Download Node.js](https://nodejs.org/))  
2. **npm**: v10.0.0 or later ([Learn about npm](https://docs.npmjs.com/))  
3. **Git**: Latest version ([Download Git](https://git-scm.com/))  
   - Ensure Git is set up and configured on your system:
     ```bash
     git --version
     ```
4. **SQLite**: Latest version ([SQLite Official Docs](https://sqlite.org/))  
5. **Docker** (optional for production deployment): ([Install Docker](https://docs.docker.com/get-docker/))  

---

### Installation

1. Clone the repository to your local machine:
    ```bash
    git clone https://github.com/your-repo-url.git
    cd your-repo-name
    ```

2. Install the project dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

4. Open the application in your browser:
    ```
    http://localhost:3000
    ```

---

### Configuration

#### Environment Variables

Create a `.env` file in the root directory and add the following keys:

```env
NODE_ENV=development
LOG_LEVEL=debug
PORT=3000
HOST_NAME=0.0.0.0
DATABASE_URL=file:./database/hospital.db
```

##### Notes:
- `NODE_ENV`: Specifies the environment (`development` or `production`).
- `LOG_LEVEL`: Sets logging verbosity (`debug`, `info`, `warn`, `error`).
- `DATABASE_URL`: Path to the SQLite database file.

For production:
- Secure sensitive variables like `DATABASE_AUTH_TOKEN` (required for cloud-hosted databases like Turso).
- Use `.env.production` for environment-specific configurations.

---

## Database Management

The project uses **SQLite** with **Drizzle ORM** for schema and migration management.

### Key Commands
- **Apply schema changes**:
    ```bash
    npm run db:push
    ```
- **Seed the database**:
    ```bash
    npm run db:seed
    ```
- **Run migrations**:
    ```bash
    npm run db:migrate
    ```

For additional database-related commands, check the `package.json` file.

---

Here’s an updated section on deployment, incorporating AWS Fargate and its benefits:

---

## Deployment

### Deployment to AWS with Fargate

The **Mock Hospital System** leverages **AWS Fargate** for deployment, managed through **SST (Serverless Stack)**. Fargate is a serverless compute engine for containers, enabling efficient deployment without managing the underlying infrastructure.

#### Benefits of Using AWS Fargate
1. **Serverless Management**: No need to provision or manage servers, reducing operational overhead.
2. **Scalability**: Automatically scales the application based on demand, ensuring consistent performance.
3. **Cost Efficiency**: Pay only for the resources used, minimizing costs for development and production environments.
4. **Enhanced Security**: Provides task isolation by design, ensuring containerized workloads are secure.

---

### Deployment Steps

#### Prerequisites
1. **AWS Account** ([Sign up](https://aws.amazon.com/))  
2. **AWS CLI** ([Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html))  
3. **Docker** ([Install Docker](https://docs.docker.com/get-docker/))  

#### Deployment Process

1. **Set Up AWS CLI**:
   - Configure AWS CLI with your IAM credentials:
     ```bash
     aws configure
     ```

2. **Prepare Environment Variables**:
   - Create a `.env.production` file for production configuration:
     ```env
     NODE_ENV=production
     LOG_LEVEL=info
     PORT=3000
     HOST_NAME=0.0.0.0
     DATABASE_URL=file:./database/hospital.db
     DATABASE_AUTH_TOKEN=some_secure_token
     ```

3. **Deploy Using SST**:
   - Check the `sst.config.ts` file for AWS configurations.
   - Deploy the application to AWS Fargate:
     ```bash
     npx sst deploy --stage production
     ```

     Alternative with `pnpm`:
     ```bash
     pnpm dlx sst deploy --stage production
     ```

4. **Access the Deployed Application**:
   - Retrieve the URL from the SST deployment logs or the AWS Console.
   - Use the deployed API endpoints for testing and integration.

---

## Additional Resources



## API Documentation

The API documentation is deployed and accessible through the following URLs:
- **OpenAPI JSON**: [http://localhost:3000/api/doc](http://localhost:3000/api/doc)  
- **Scalar Client**: [http://localhost:3000/api/reference](http://localhost:3000/api/reference)  

These resources provide detailed endpoint definitions and examples for testing and development.

---

## Best Practices

1. **Secure Configuration**: Use `.env` files for sensitive environment variables, especially in production.
2. **Error Handling**: Implement robust middleware for error management in the API.
4. **Testing**: Ensure comprehensive testing of all features to maintain reliability.
5. **Documentation**: Keep all documentation up to date with project changes.

---

## Additional References

- **HonoJS Documentation**: [Hono Docs](https://hono.dev/)  
- **Drizzle ORM Documentation**: [Drizzle ORM](https://orm.drizzle.team/)  
- **SQLite Documentation**: [SQLite Docs](https://sqlite.org/)  
- **Turso Documentation**: [Turso Docs](https://turso.tech/docs)  
- **AWS Fargate Documentation**: [Fargate Docs](https://aws.amazon.com/fargate/)  
- **SST Documentation**: [SST Docs](https://sst.dev/)  

