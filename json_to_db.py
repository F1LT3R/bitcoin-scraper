import json
import sys
import sqlite3
import os


no_ending = os.path.splitext(sys.argv[1])[0]
file_fields = no_ending.split("_")

currency = file_fields[-2]
asset = file_fields[-1]
table_name = "candles_{}_{}".format(currency.upper(), asset.upper())
conn = sqlite3.connect(no_ending +".db")
data = json.load(open(sys.argv[1], "r"))
field_headers = [
        "start",
        "open",
        "high",
        "low",
        "close",
        "vwp",
        "volume",
        "trader",
        ]




sql_insert = 'insert into candles_{}_{} values (null, ?, ?, ?, ?, ?, ?, ?, ?);'.format(currency, asset)
sql_drop_table = "DROP TABLE IF EXISTS candles_{}_{} ".format(currency, asset)

sql_create_table = '''CREATE TABLE IF NOT EXISTS candles_{}_{} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start INTEGER UNIQUE,
        open REAL NOT NULL,
        high REAL NOT NULL,
        low REAL NOT NULL,
        close REAL NOT NULL,
        vwp REAL NOT NULL,
        volume REAL NOT NULL,
        trades INTEGER NOT NULL
      );'''.format(currency, asset)
count = 0
if conn is not None:
    c = conn.cursor()

    c.execute(sql_drop_table)
    c.execute(sql_create_table)
    for row in data:
        if data:
            try:
                c.execute(sql_insert, tuple(row))
            except sqlite3.IntegrityError:
                print("Multiple unique values encountered, ignoring entry")
                count = count+1

    conn.commit()
    conn.close()
else:
    print("Cant connect to database")

print(" {} unique rows collided.".format(count))


