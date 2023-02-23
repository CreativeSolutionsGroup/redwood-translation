export interface Env {
    URL: string;
    API_KEY: string;
}

interface Input {
    proxID: string;
}

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                }
            })
        } else if (request.method === "GET") {
            const { searchParams } = new URL(request.url);

            const authorization = request.headers.get("authorization");
            if (authorization == null) return new Response(null, { status: 401 });

            // This is a workaround until we have a central auth server.
            // To use the user path you must have the `view` credential.
            const authRes = await fetch("https://kiosk-backend.cusmartevents.com/api/user", { headers: { authorization } })
            if (authRes.status !== 200) return new Response(null, { status: 403 });

            const person = await fetch(env.URL + searchParams.get("id"), {
                headers: {
                    "x-functions-key": env.API_KEY
                }
            })

            return new Response(JSON.stringify(await person.json()), {
                headers: {
                    "content-type": "application/json"
                }
            })
        } else {
            return new Response(null, {
                status: 405, headers: {
                    "Allow": "GET, HEAD, OPTIONS"
                }
            })
        }
    },
};
