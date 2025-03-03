"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyContact = void 0;
const connect_1 = __importDefault(require("../database/connect"));
// Helper function to get linked contacts
const getLinkedContacts = (client, primaryContactId) => __awaiter(void 0, void 0, void 0, function* () {
    const linkedContactsQuery = `SELECT * FROM Contact WHERE linkedid = $1 OR id = $1`;
    const { rows: linkedContacts } = yield client.query(linkedContactsQuery, [
        primaryContactId,
    ]);
    return linkedContacts;
});
// Helper function to update contact to secondary
const updateContactToSecondary = (client, primaryContactId, contactId) => __awaiter(void 0, void 0, void 0, function* () {
    const updateQuery = `
    UPDATE Contact
    SET linkedid = $1, linkprecedence = 'secondary'
    WHERE id = $2
  `;
    yield client.query(updateQuery, [primaryContactId, contactId]);
});
// Helper function to insert a new secondary contact
const insertSecondaryContact = (client, phoneNumber, email, primaryContactId) => __awaiter(void 0, void 0, void 0, function* () {
    const insertContactQuery = `
    INSERT INTO Contact (phonenumber, email, linkedid, linkprecedence)
    VALUES ($1, $2, $3, 'secondary')
    RETURNING id, createdat
  `;
    yield client.query(insertContactQuery, [
        phoneNumber,
        email,
        primaryContactId,
    ]);
});
// Helper function to create a new primary contact
const createPrimaryContact = (client, phoneNumber, email) => __awaiter(void 0, void 0, void 0, function* () {
    const insertContactQuery = `
    INSERT INTO Contact (phonenumber, email, linkprecedence)
    VALUES ($1, $2, 'primary')
    RETURNING id, createdat
  `;
    const { rows } = yield client.query(insertContactQuery, [phoneNumber, email]);
    return rows[0];
});
// Helper function to get the contact with id
const getContact = (client, id) => __awaiter(void 0, void 0, void 0, function* () {
    const linkedContactQuery = `
    SELECT * FROM Contact WHERE id = $1
  `;
    const { rows } = yield client.query(linkedContactQuery, [id]);
    const contact = rows[0];
    return contact;
});
// Identify or create contact
const identifyContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phoneNumber } = req.body;
    console.log("identify request from email: " + email + "  phone number: " + phoneNumber);
    try {
        const client = yield connect_1.default.connect();
        // Fetch existing contacts by email and phone number
        const contactQuery = `
      SELECT * FROM Contact WHERE (email = $1 AND email IS NOT NULL) OR (phonenumber = $2 AND phonenumber IS NOT NULL)
    `;
        const { rows: existingContacts } = yield client.query(contactQuery, [
            email,
            phoneNumber,
        ]);
        let primaryContact = null;
        let primaryContactId = null;
        let emails = new Set();
        let phoneNumbers = new Set();
        let secondaryContactIds = [];
        let finalContacts = [];
        if (existingContacts.length > 0) {
            // Find the oldest primary contact
            primaryContact = existingContacts.reduce((oldest, contact) => {
                return contact.createdAt < oldest.createdAt ? contact : oldest;
            }, existingContacts[0]);
            if (primaryContact) {
                primaryContactId = primaryContact.id;
                let currentEmails = new Set();
                let currentPhoneNumbers = new Set();
                existingContacts.forEach((contact) => {
                    if (contact.email)
                        currentEmails.add(contact.email);
                    if (contact.phonenumber)
                        currentPhoneNumbers.add(contact.phonenumber);
                });
                // Check if the provided email or phone number is new and needs to create a secondary contact
                const isEmailNew = email && !currentEmails.has(email);
                const isPhoneNumberNew = phoneNumber && !currentPhoneNumbers.has(phoneNumber);
                if (isEmailNew || isPhoneNumberNew) {
                    yield insertSecondaryContact(client, phoneNumber, email, primaryContactId);
                }
                // Ensure all contacts are properly linked
                for (let contact of existingContacts) {
                    //if a contact is secondary
                    if (contact.linkprecedence === "secondary" &&
                        contact.id !== primaryContactId) {
                        while (contact.linkprecedence !== "primary") {
                            //check if the contact is primary and break if it is
                            if (contact.linkprecedence === "primary")
                                break;
                            // Get the contact of the linkedid
                            let linkedContact = yield getContact(client, contact.linkedid);
                            // Compare the current primary contact and the linkedContact
                            // and check which one is oldest according to the createdat timestamp
                            if (new Date(linkedContact.createdat).getTime() < new Date(primaryContact.createdat).getTime()) {
                                // If linked contact is oldest then swap the primary contact to the linked contact
                                // and linked contact as the primary contact
                                [primaryContact, linkedContact] = [linkedContact, primaryContact];
                                primaryContactId = primaryContact.id;
                            }
                            //Update the contact to secondary
                            yield updateContactToSecondary(client, primaryContactId, contact.id);
                            contact = linkedContact;
                        }
                    }
                    if (contact.linkprecedence === "primary" &&
                        contact.id !== primaryContactId) {
                        yield updateContactToSecondary(client, primaryContactId, contact.id);
                    }
                }
            }
        }
        else {
            // Create a new primary contact
            primaryContact = yield createPrimaryContact(client, phoneNumber, email);
            if (primaryContact)
                primaryContactId = primaryContact.id;
        }
        // Get all the contacts which are linked to primaryContactId
        const linkedContacts = yield getLinkedContacts(client, primaryContactId);
        // Add linked contacts to the existing contacts array
        finalContacts.push(...linkedContacts);
        // Process existing contacts for the response and order them from oldest to newest
        finalContacts.sort((a, b) => new Date(a.createdat).getTime() - new Date(b.createdat).getTime());
        // Sort data for response
        finalContacts.forEach((contact) => {
            if (contact.email)
                emails.add(contact.email);
            if (contact.phonenumber)
                phoneNumbers.add(contact.phonenumber);
            if (contact.id !== primaryContact.id) {
                secondaryContactIds.push(contact.id);
            }
        });
        client.release();
        res.json({
            contact: {
                primaryContactId,
                emails: Array.from(emails),
                phoneNumbers: Array.from(phoneNumbers),
                secondaryContactIds,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error " + error);
    }
});
exports.identifyContact = identifyContact;
