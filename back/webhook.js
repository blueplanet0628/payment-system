const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const dayjs = require('dayjs');
const formattedDate = dayjs(new Date()).format('YYYY/MM/DD');
const { addUserToSheet } = require('./googlesheet');
const {createUserSheet} = require('./createSheet')
const {getUserSheetId} = require('./getSheetId')
const {grantSheetAccess} = require('./sheetUpdate')

async function webhook(req, res) {

    try {
        const sig = req.headers["stripe-signature"];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const email = session.customer_details.email;
            const name = session.customer_details.name || 'No Name';
            const card = session.metadata.card || 'Unknown';
            const baseLimit = session.metadata.baseLimit || 'Unknown';
            const extraSheets = session.metadata.extraSheets || 'Unknown';
          
            const sheetId = await getUserSheetId(email);
            
            if (sheetId) {
                const role = "reader"
                
                await grantSheetAccess(email, sheetId, role);
            } else {
                await createUserSheet(name, email);
                const sheetId = await createUserSheet(name, email);
                await addUserToSheet(email, name, card, formattedDate, baseLimit, extraSheets, sheetId)
            }
            console.log(sheetId,'sheetID');
            
            res.status(200).json({ received: true });

        }

    } catch (err) {
    }
}
module.exports = { webhook };