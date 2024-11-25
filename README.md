# Mock Hospital System

## Getting Started

### Prerequisites

-   Node.js v20.0.0 or later
-   npm v10.0.0 or later

### Installation

-   Run the following commands to install the project dependencies:
    ```
    npm install
    ```
-   Run the following command to start the server in development mode:
    ```
    npm run dev
    ```
-   Open the following URL in your browser:
    ```
    http://localhost:3000
    ```

### Environment Variables

Starting the might fail if the environment variables are not set. Create a `.env` file in the root directory of the project and add the following environment variables:

```
NODE_ENV=development
LOG_LEVEL=debug
PORT=3000
HOST_NAME=0.0.0.0
DATABASE_URL=file:./database/hospital.db
```

INFO: The `DATABASE_URL` environment variable is used to specify the path to the SQLite database file.
INFO: The `NODE_ENV` environment variable is used to specify the environment in which the application is running. The value should be either `development` or `production`.
INFO: The `LOG_LEVEL` environment variable is used to specify the log level. The value should be either `debug`, `info`, `warn`, or `error`.

NOTE: The `.env` file should not be committed to the repository.
NOTE: In production, the `DATABASE_URL` environment variable should be set to a different value. The `NODE_ENV` environment variable should be set to `production`. And finally the database authentication should be set to a more secure method. Set the variable `DATABASE_AUTH_TOKEN` to a secure value. Here we are using **TURSO** as the online database. You create an account and get the token from there.

### Database

The project uses an SQLite database to store the data. The database file is located at `./database/hospital.db`. The database schema is defined in the `./src/db/schema.ts` file based on the `drizzle` library.

-   You can make quick updates to the database by running the following command:

    ```
    npm run db:push
    ```

    This command will apply the changes to the database schema.

-   You can also seed the database with data by running the following command:

    ```
    npm run db:seed
    ```

    This command will seed the database with sample data.

-   You can also do migrations the database by running the following command:
    ```
    npm run db:migrate
    ```

NOTE: Check `package.json` for more database related commands.

### Deployment to AWS
#### Prerequisites
- AWS Account
- AWS CLI
- AWS IAM User with AdministratorAccess
- Docker


#### Steps
- Create a new IAM user with AdministratorAccess and download the credentials.
- Configure the AWS CLI with the credentials.
- Create a new environment variable files for the production environment. Create a `.env.production` file in the root directory of the project and add the following environment variables:
    ```
    NODE_ENV=production
    LOG_LEVEL=info
    PORT=3000
    HOST_NAME=0.0.0.0
    DATABASE_URL=file:./database/hospital.db
    DATABASE_AUTH_TOKEN=some_secure_token
    ```
- check the `sst.config.ts` file for the configuration of the stack. Update where necessary.
- Run the following command to deploy the application to AWS:
    ```
    npx sst deploy --stage production
    ```

    OR

    ```
    pnpm dlx sst deploy --stage production
    ```
