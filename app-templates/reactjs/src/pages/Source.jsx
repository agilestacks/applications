import {Code} from '../components';
const {
    APPLICATION_REPOSITORY,
    APPLICATION_BRANCH = 'master'
} = process.env;
export function Source() {
    return (
        <div>
            <h1>Application Source</h1>
            <p>
                This application was built from repository
                <Code>
                    {`git@github.com:${APPLICATION_REPOSITORY}.git`}
                </Code>
                which was generated from Agilestacks React Web Application Template.
            </p>
        </div>
    )
}