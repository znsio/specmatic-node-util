import listExpressEndpoints from 'express-list-endpoints';
const END_POINTS_API_ROUTE = '_specmatic/endpoints';

export const enableApiCoverage = (expressApp: any) => {
    process.env['endpointsAPI'] = END_POINTS_API_ROUTE;
    addEndPointsRoute(expressApp);
    console.log(`Endpoints API registered at ${END_POINTS_API_ROUTE}`);
};

const listEndPoints = (expressApp: any): { [key: string]: string[] } => {
    const details = listExpressEndpoints(expressApp);
    let endPoints: { [key: string]: string[] } = {};
    details.map(apiDetail => {
        endPoints[apiDetail.path] = apiDetail.methods;
    });
    delete endPoints[`/${END_POINTS_API_ROUTE}`];
    return endPoints;
};

const addEndPointsRoute = (expressApp: any) => {
    expressApp.get(`/${END_POINTS_API_ROUTE}`, (_req: any, res: any) => {
        let endPoints = listEndPoints(expressApp);
        let springActuatorPayload = {
            contexts: {
                application: {
                    mappings: {
                        dispatcherServlets: {
                            dispatcherServlet: [],
                        },
                    },
                },
            },
        };
        Object.keys(endPoints)
            .sort()
            .map(path => {
                springActuatorPayload.contexts.application.mappings.dispatcherServlets.dispatcherServlet.push({
                    details: {
                        requestMappingConditions: {
                            methods: endPoints[path].sort(),
                            patterns: [path],
                        },
                    },
                } as never);
            });
        res.send(springActuatorPayload);
    });
};