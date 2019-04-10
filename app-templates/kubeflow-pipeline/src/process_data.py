#!/usr/bin/env python3
# -*- coding: utf-8 -*-

'''
Generates the training and test set. Only processes "sample-size" rows.

usage example:
process_data.py \
  --input_csv=data-sample.csv \
  --sample_size=200 \
  --output_traindf_csv=github_issues_medium_train.csv \
  --output_testdf_csv=github_issues_medium_test.csv
'''

import argparse
import pandas as pd
from sklearn.model_selection import train_test_split

# Parsing flags.
parser = argparse.ArgumentParser()
parser.add_argument("--input_csv")
parser.add_argument("--sample_size", type=int, default=2000000)
parser.add_argument("--output_traindf_csv")
parser.add_argument("--output_testdf_csv")
args = parser.parse_args()
print(args)

pd.set_option('display.max_colwidth', 500)

# Read in data sample 2M rows (for speed of tutorial)
traindf, testdf = train_test_split(pd.read_csv(args.input_csv).sample(n=args.sample_size),
                                   test_size=.10)

# Print stats about the shape of the data.
print('Train: {:,} rows {:,} columns'.format(traindf.shape[0], traindf.shape[1]))
print('Test: {:,} rows {:,} columns'.format(testdf.shape[0], testdf.shape[1]))

# Store output as CSV.
traindf.to_csv(args.output_traindf_csv)
testdf.to_csv(args.output_testdf_csv)
