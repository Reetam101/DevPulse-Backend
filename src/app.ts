import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import compression from 'compression';
import dotenv from 'dotenv';
import session from 'express-session';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

// Import routes
// import routes from './routes';

// Import middleware
import errorMiddleware from './middlewares/error.middleware';

class App {
    public app: Application;
    public port: string | number;
    public env: string;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.env = process.env.NODE_ENV || 'development';

        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares(): void {
        // Security middleware
        this.app.use(helmet());

        // CORS configuration
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
        }));

        // Body parsers
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Compression
        // this.app.use(compression());
        this.app.use(session({
            secret: process.env.SESSION_SECRET!,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            }
        }));

        // Logger middleware (add your own)
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            console.log(`${req.method} ${req.path}`);
            next();
        });
    }

    private initializeRoutes(): void {
        // Health check
        this.app.get('/health', (req: Request, res: Response) => {
            res.status(200).json({
                status: 'success',
                message: 'Server is running',
                timestamp: new Date().toISOString(),
            });
        });

        // API routes
        this.app.use('/api/v1/auth', authRoutes);

        // 404 handler
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({
                status: 'error',
                message: 'Route not found',
            });
        });
    }

    private initializeErrorHandling(): void {
        this.app.use(errorMiddleware);
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log(`🚀 Server running in ${this.env} mode on port ${this.port}`);
        });
    }
}

export default App;