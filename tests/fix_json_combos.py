import ast
import json

import pymysql

# --- CONFIGURE THESE ---
DB_HOST = ""
DB_USER = ""
DB_PASS = ""
DB_NAME = "py4web"
DB_PORT = 3306


def is_valid_json(s):
    try:
        obj = json.loads(s)
        return isinstance(obj, list)
    except Exception:
        return False


def try_python_literal(s):
    try:
        obj = ast.literal_eval(s)
        return isinstance(obj, list), obj
    except Exception:
        return False, None


def main():
    conn = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        port=DB_PORT,
        charset="utf8mb4",
    )
    cur = conn.cursor()
    cur.execute("SELECT id, combo_name, combo_codes FROM billing_combo")
    rows = cur.fetchall()
    fixed = 0
    for combo_id, combo_name, combo_codes in rows:
        if combo_codes is None:
            continue
        if is_valid_json(combo_codes):
            continue  # Already valid
        # Try to fix
        ok, obj = try_python_literal(combo_codes)
        if ok:
            try:
                combo_codes_json = json.dumps(obj, ensure_ascii=False)
                cur.execute(
                    "UPDATE billing_combo SET combo_codes=%s WHERE id=%s",
                    (combo_codes_json, combo_id),
                )
                print(f"Fixed combo {combo_id} ({combo_name})")
                fixed += 1
            except Exception as e:
                print(f"ERROR updating combo {combo_id}: {e}")
        else:
            print(
                f"Could not fix combo {combo_id} ({combo_name}): not valid JSON or Python literal"
            )
    if fixed:
        conn.commit()
    print(f"Done. Fixed {fixed} combos.")
    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
