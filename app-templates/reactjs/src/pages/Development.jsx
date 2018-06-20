import {Code} from '../components';

export function Development() {
    return (
        <div>
            <h1>Application Development</h1>

            <h3>Prepare</h3>
            <p>
                To init application development just run
                <Code>
                    npm install
                </Code>
                This will install all application dependencies.
            </p>

            <h3>Development Environment</h3>
            <p>
                To begin the development run
                <Code>
                    npm start
                </Code>
                This will locally start your application serving on port
                <Code>
                    http://localhost:8081
                </Code>
                So you can open it on browser.
            </p>
            <p>
                Server will watch for changes are made to the code and refresh the client each time it occurred.
            </p>
            <h3>Production Environment</h3>
            <p>
                To create a build run
                <Code>
                    npm run build
                </Code>
                Production deploy ready application content will output to folder
                <Code>
                    ./dist/
                </Code>
            </p>
        </div>
    )
}