import { NextFunction } from 'express-serve-static-core';
import app from './server'

if(!process.env.PORT) {
    process.exit(1);
}

const port: number = Number(process.env.PORT || 8080);
app.listen(port, () => {
    console.log("Server listening on port " + port);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {

});