import User from './models/User.model';
import server from './server'
import { Payload } from './types';

declare global {
    namespace Express {
        interface Request {
            user?: Payload; 
            userClient?: User
        }
    }
}

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log(`Server corriendo en el puerto ${PORT}`)
})
