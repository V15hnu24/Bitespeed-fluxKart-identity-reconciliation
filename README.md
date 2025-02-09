# FluxKart-Identity-Reconciliation


Task overiew:
Meet the brilliant yet eccentric Dr. Emmett Brown, better known as Doc. Hopelessly stuck in 2023, he is fixing his time machine to go back to the future and save his friend. His favourite online store FluxKart.com sells all the parts required to build this contraption. As crazy as he might get at times, Doc surely knows how to be careful. To avoid drawing attention to his grandiose project, Doc is using different email addresses and phone numbers for each purchase.

FluxKart.com is deadpan serious about their customer experience. There is nothing more important than rewarding their loyal customers and giving a personalised experience. To do this, FluxKart decides to integrate a system into their platform. System collects contact details from shoppers for a personalised customer experience. 

This project is to implement the system.


## Features

- **Contact Identification**: Identify contacts based on email or phone number.
- **Linking Contacts**: Link contacts with the same email or phone number.
- **Primary and Secondary Contacts**: Manage primary and secondary contacts effectively.

## Project Structure

```
fluxkart/
├── dist/
│
├── src/
│   ├── controllers/
│   │   └── contactController.ts
│   ├── models/
│   │   └── contactModel.ts
│   ├── database/
│   │   └── connect.ts
│   ├── index.ts
├── utils/
│   ├── contact-schema.sql 
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/my-project.git
   cd my-project
   ```

2. Install dependencies:

   ```bash
   npm install
   ```
   
## Database Schema

Use the SQL schema from `utils/contact-schema.sql` to create the `Contact` table and the necessary trigger for updating the `updatedAt` column.

## Usage

1. Start the server:

   ```bash
   npm start
   ```

2. The server will run on `http://localhost:3000`.
   Visit `http://localhost:3000/` in your web browser to see "Hello, World!".

## API Endpoints

### Identify Contact

**POST /identify**

Identifies and links customer contacts based on email and phone number.

**Request Body:**

```json
{
  "email": "string",
  "phoneNumber": "string"
}
```

**Response:**

```json
{
  "contact": {
    "primaryContactId": number,
    "emails": ["string"],
    "phoneNumbers": ["string"],
    "secondaryContactIds": [number]
  }
}
```

## Example Request

```bash
curl -X POST http://localhost:3000/identify -H "Content-Type: application/json" -d '{"email": "example@example.com", "phoneNumber": "1234567890"}'
```

**Example Response:**

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["example@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```


### Deployment

This project is deployed on the Render.com platform.

**Hosted Endpoint:** [https://fluxkart-identity-reconciliation.onrender.com/identify](https://fluxkart-identity-reconciliation.onrender.com/identify)


