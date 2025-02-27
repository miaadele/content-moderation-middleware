from datetime import datetime, timezone


date = 1739545418254/1000

local = datetime.fromtimestamp(date)
utc = datetime.fromtimestamp(date, tz=timezone.utc)

print(local)
print(type(local))

print(utc)
print(type(utc))
