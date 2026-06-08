const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(bodyParser());

let tickets = [];
let nextId = 1;

const initTickets = () => {
    tickets = [
        { id: nextId++, name: 'Поменять лампочку', status: false, created: Date.now() },
        { id: nextId++, name: 'Починить принтер', status: true, created: Date.now() },
        { id: nextId++, name: 'Настроить VPN', status: false, created: Date.now() },
    ];
};
initTickets();

router.get('/', async (ctx) => {
    const { method, id } = ctx.query;

    switch (method) {
        case 'allTickets':
            
            ctx.body = tickets.map(({ id, name, status, created }) => ({
                id, name, status, created
            }));
            break;

        case 'ticketById':
            if (!id) {
                ctx.status = 400;
                ctx.body = { error: 'Missing id' };
                return;
            }
            const ticket = tickets.find(t => t.id == id);
            if (!ticket) {
                ctx.status = 404;
                ctx.body = { error: 'Ticket not found' };
                return;
            }
            ctx.body = ticket;
            break;

        default:
            ctx.status = 404;
            ctx.body = { error: 'Unknown method' };
    }
});


router.post('/', async (ctx) => {
    const { method, id } = ctx.query;
    const { name, description, status } = ctx.request.body;

    switch (method) {
        case 'createTicket':
            if (!name) {
                ctx.status = 400;
                ctx.body = { error: 'Name is required' };
                return;
            }
            const newTicket = {
                id: nextId++,
                name,
                description: description || '',
                status: status === true || status === 'true',
                created: Date.now()
            };
            tickets.push(newTicket);
            ctx.body = newTicket;
            break;

        case 'updateTicket':
            if (!id) {
                ctx.status = 400;
                ctx.body = { error: 'Missing id' };
                return;
            }
            const index = tickets.findIndex(t => t.id == id);
            if (index === -1) {
                ctx.status = 404;
                ctx.body = { error: 'Ticket not found' };
                return;
            }
            if (name !== undefined) tickets[index].name = name;
            if (description !== undefined) tickets[index].description = description;
            if (status !== undefined) tickets[index].status = status === true || status === 'true';
            ctx.body = tickets[index];
            break;

        case 'deleteTicket':
            if (!id) {
                ctx.status = 400;
                ctx.body = { error: 'Missing id' };
                return;
            }
            const ticketIndex = tickets.findIndex(t => t.id == id);
            if (ticketIndex === -1) {
                ctx.status = 404;
                ctx.body = { error: 'Ticket not found' };
                return;
            }
            tickets.splice(ticketIndex, 1);
            ctx.body = { success: true };
            break;

        default:
            ctx.status = 404;
            ctx.body = { error: 'Unknown method' };
    }
});

const PORT = process.env.PORT || 3000;
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Test tickets: ${tickets.length}`);
});