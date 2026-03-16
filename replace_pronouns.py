import os
import glob

replacements = {
    "معلمة": "معلم",
    "المعلمة": "المعلم",
    "طالباتكِ": "طلابك",
    "طالباتك": "طلابك",
    "طالبتي": "طالبي",
    "أدخلي": "أدخل",
    "طالبات": "طلاب",
    "اكتبي": "اكتب",
    "شيختي": "المعلم",
    "الشيخة سناء": "الشيخة سناء أبو العيد",
    "طالبة": "طالب",
    "لكِ": "لك",
    "مساعدكِ": "مساعدك",
    "باسمكِ": "باسمك",
    "اسمكِ": "اسمك",
    "وقتكِ": "وقتك",
    "جهدكِ": "جهدك",
    "عملكِ": "عملك",
    "تقومي": "تقوم",
    "تستطيعي": "تستطيع",
    "تريدي": "تريد",
    "شاركتها": "شاركها",
    "شاركتيه": "شاركته",
    "إجابتكِ": "إجابتك",
    "أضيفي": "أضف",
    "استوردي": "استورد",
    "ابدئي": "ابدأ",
    "حاولي": "حاول",
    "احصلي": "احصل",
    "اضغطي": "اضغط",
    "اختباراتكِ": "اختباراتك",
    "طالبتكِ": "طالبك",
    "طالبتك": "طالبك",
    "الطالبة": "الطالب"
}

for filepath in glob.glob("src/**/*.tsx", recursive=True) + glob.glob("src/**/*.ts", recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

