import {Feature} from '../components';
const {
    APPLICATION_REPOSITORY,
    APPLICATION_BRANCH = 'master'
} = process.env;

const features = [
    {
        name: 'Babel',
        version: '6.26',
        link: 'https://babeljs.io/'
    },
    {
        name: 'Webpack',
        version: '3.12',
        link: 'https://webpack.js.org/'
    },
    {
        name: 'React',
        version: '16.2',
        link: 'https://reactjs.org/'
    },
    {
        name: 'React router',
        version: '4.3',
        link: 'https://github.com/ReactTraining/react-router'
    },
    {
        name: 'Blueprintjs',
        version: '2.3',
        link: 'http://blueprintjs.com/docs/v2/'
    },
];
export function Features() {
    return (
        <div>
            <h1>Application Features</h1>
            <p>
                From the scratch the application supports the following features
            </p>
            <ul>
                {
                    features.map(feature => <li key={feature.name}><Feature {...feature} /></li>)
                }
            </ul>
        </div>
    )
}