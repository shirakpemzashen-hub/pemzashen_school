#!/usr/bin/env python3
"""
Fix the encoding corruption in panel.tsx.
The file's Armenian string literals were opened as Windows-1251,
misread as Cyrillic/Latin characters, and saved back as UTF-8.

To reverse: encode each garbled character back to its Windows-1251 byte,
then decode those bytes as UTF-8.

Only characters with code points > 127 in the garbled string need
conversion. ASCII characters pass through unchanged.
"""
import re
import sys

def ungarble(s):
    """Convert a garbled string (Win-1251 bytes saved as UTF-8 code points) back to Armenian UTF-8."""
    byte_list = []
    i = 0
    while i < len(s):
        c = s[i]
        cp = ord(c)
        if cp < 128:
            # ASCII — keep as-is
            byte_list.append(cp)
        else:
            # Try to encode as Windows-1251 to get back the original byte
            try:
                encoded = c.encode('windows-1251')
                byte_list.extend(encoded)
            except (UnicodeEncodeError, LookupError):
                # Can't encode to Win-1251 — keep original UTF-8 bytes
                byte_list.extend(c.encode('utf-8'))
        i += 1
    try:
        return bytes(byte_list).decode('utf-8')
    except UnicodeDecodeError:
        return s  # Return original if decoding fails

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to fix string literals in JSX/TSX.
    # Strategy: find all runs of non-ASCII characters mixed with ASCII
    # that appear to be garbled (contain Cyrillic letters from Windows-1251 corruption).
    #
    # The garbled text has a distinctive pattern: it contains Cyrillic capital letters
    # (Х, Ф, Ц, Ѕ, etc.) mixed with Latin-1 chars (±, ¬, µ, », etc.)
    # These are the Windows-1251 representations of the original UTF-8 Armenian bytes.
    #
    # We'll find JSX text content and string literals containing these patterns
    # and convert them.

    # Pattern: sequences that look like garbled Win-1251 text
    # (Cyrillic chars mixed with high Latin-1 chars, no actual Armenian Unicode range U+0531-U+058F)

    # Find all non-ASCII sequences (they're either already Armenian or garbled)
    # We check: if the sequence contains Cyrillic (U+0400-U+04FF) chars,
    # it's likely garbled. Armenian chars are U+0531-U+058F.

    result_parts = []
    last_end = 0

    # Find runs of characters that include Cyrillic (garbled Armenian)
    # Pattern: any string of chars where at least one is in Cyrillic range
    for m in re.finditer(r'[^\x00-\x7F]+', content):
        chunk = m.group(0)
        start, end = m.span()

        # Check if this chunk contains Cyrillic characters (sign of corruption)
        has_cyrillic = any('Ѐ' <= c <= 'ӿ' for c in chunk)
        has_armenian = any('Ա' <= c <= '֏' for c in chunk)

        if has_cyrillic and not has_armenian:
            # This chunk is garbled — convert it
            fixed = ungarble(chunk)
            result_parts.append(content[last_end:start])
            result_parts.append(fixed)
            last_end = end
        # else: leave it (Armenian or other non-Cyrillic — already correct)

    result_parts.append(content[last_end:])
    fixed_content = ''.join(result_parts)

    # Count changes
    original_cyrillic_chunks = len(re.findall(r'[^\x00-\x7FԱ-֏ՙ-՟ﬓ-ﬗ]+', content))

    with open(path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)

    print(f"Fixed: {path}")
    print(f"Sample: first 200 chars of result content:")
    # Show some of the converted text
    for m in re.finditer(r'[Ա-֏]{3,}', fixed_content):
        print(f"  Armenian found: {m.group(0)[:80]}")
        if len(list(re.finditer(r'[Ա-֏]{3,}', fixed_content))) > 20:
            break

if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else 'app/admin/panel.tsx'
    process_file(path)
