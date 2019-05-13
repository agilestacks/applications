from textacy.preprocess import preprocess_text

def textacy_cleaner(text: str) -> str:
    try:
    # print(f"Preproc: {text}")
        return preprocess_text(text,
                            fix_unicode=False,
                            lowercase=True,
                            transliterate=True,
                            no_urls=True,
                            no_emails=True,
                            no_phone_numbers=True,
                            no_numbers=True,
                            no_currency_symbols=True,
                            no_punct=True,
                            no_contractions=False,
                            no_accents=True)
    except:
        print(f"Invalid text {type(text)}: {text}")
        return "ERROR"
