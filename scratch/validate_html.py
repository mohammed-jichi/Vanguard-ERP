import re

with open(r'c:\Users\User\OneDrive\Documents\Vanguard and Oil Product V2\index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []

for line_num, line in enumerate(lines, 1):
    # Find all div tags in line
    divs = re.findall(r'</?div[^>]*>', line)
    for tag in divs:
        if tag.startswith('</'):
            if stack:
                stack.pop()
            else:
                print(f"L{line_num}: Extra closing </div> tag!")
        else:
            m_id = re.search(r'id=["\']([^"\']+)["\']', tag)
            tag_id = m_id.group(1) if m_id else ''
            m_cls = re.search(r'class=["\']([^"\']+)["\']', tag)
            tag_cls = m_cls.group(1) if m_cls else ''
            stack.append((line_num, tag_id, tag_cls))

print(f"\nRemaining unclosed divs count: {len(stack)}")
for lnum, tid, tcls in stack:
    print(f"Unclosed div at line {lnum}: id='{tid}', class='{tcls}'")
