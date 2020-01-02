import React, { useState, useCallback } from 'react';
import { CubeEx } from '../CubeEx';
import {sampleSize, sample, difference, debounce, random, uniq} from 'lodash';

const tags = [
    'helm', 'kustomize', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform', 'docker', 'shell', 'vault', 'istio'
];
const HISTORY_LIMIT = Math.floor(tags.length * .7);
const KEYWORDS_LENGTH = 3;

export const Teaser = () => {
    const [keywords, setKeywords] = useState(sampleSize(tags, KEYWORDS_LENGTH));
    const [history, setHistory] = useState(keywords);

    const onToggleKeyword = useCallback(debounce(
        () => {
            const nextKeyword = sample(difference(tags, [...history, ...keywords]));
            setHistory(
                [
                    nextKeyword,
                    ...history
                ].slice(0, HISTORY_LIMIT)
            );
            const nextKeywords = keywords
                .slice();

            const nextIndex = random(KEYWORDS_LENGTH - 1);

            nextKeywords
                .splice(
                    nextIndex,
                    1,
                    nextKeyword
                );

            setKeywords(nextKeywords);
        },
        100
    ), [keywords, history, tags, setKeywords, setHistory, HISTORY_LIMIT, KEYWORDS_LENGTH]);
    return (
        <div className="asi-teaser">
            <h1>Agile<span className="asi-teaser-stacks">Stacks</span></h1>
            <div className="asi-teaser-keywords">
                {
                    keywords.map((keyword) => (
                        <h2 key={keyword} className="asi-teaser-keyword">{keyword}</h2>
                    ))
                }
            </div>
            <div>with no pain</div>
            <CubeEx onToggleKeyword={onToggleKeyword} />
        </div>
    )
}