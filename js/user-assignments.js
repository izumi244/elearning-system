// ユーザー別課題提出スプレッドシート設定
// 各ユーザーのuserIdと対応するGoogle SpreadsheetのURLマッピング

const USER_ASSIGNMENT_SHEETS = {
    'demo456': 'https://docs.google.com/spreadsheets/d/12sZFt8iCuHoPC4XuSkxMvh1wWVqh7LhqyKeftPY6AiQ/edit?usp=drive_link',
    'test123': 'https://docs.google.com/spreadsheets/d/1mOXkxBTRXV9RUbRpPTTXOm0SHrda1QJiUSNRrj5VKjA/edit?usp=drive_link',
    'user001': 'https://docs.google.com/spreadsheets/d/1pezwBjj-9-nyiDR_HwlTyZbGNAwqB1aEskxFpJRMLlg/edit?usp=drive_link',
    'user002': 'https://docs.google.com/spreadsheets/d/16-TbHJF2zgU7mw1iKp4lqs5TocJNY-nr_NsIaVJuOQY/edit?usp=drive_link',
    'user003': 'https://docs.google.com/spreadsheets/d/15-Zi2KbVin9KN9CCfwrUt95RomS1Id5ujmGqd6oWcUc/edit?usp=drive_link',
    'user004': 'https://docs.google.com/spreadsheets/d/1K9rGnPKJs0UmMi9BmRLMAD1ct_UK94kGxryYXcOSWQA/edit?usp=drive_link',
    'user005': 'https://docs.google.com/spreadsheets/d/15S-9eRPWciwKfMdss0W6aOov7f5coXwImg_2ljN4ft0/edit?usp=drive_link',
    'user006': 'https://docs.google.com/spreadsheets/d/11DHkGln5BxklSPMSYmCsrXfzOQJ_1i0KwZ8vmdpubFA/edit?usp=drive_link',
    'user007': 'https://docs.google.com/spreadsheets/d/117tc4lvSkJQTSVcLH4XAHKX4wmFQPJ1PsaRH259dGGA/edit?usp=drive_link',
    'user008': 'https://docs.google.com/spreadsheets/d/1DGoT4NO89viBufpJLaQGOQan8J-mJATJpNyGuza9-hk/edit?usp=drive_link',
    'user009': 'https://docs.google.com/spreadsheets/d/1JE14ikdVUcnY0JxJD5dI5hJ_lAffEJUQfzCTXay6Lfg/edit?usp=drive_link',
    'user010': 'https://docs.google.com/spreadsheets/d/1LBZAizjq6aEZw5ZdmALrIfasfzgMhOHIT8N6hFjh6UA/edit?usp=drive_link',
    'user011': 'https://docs.google.com/spreadsheets/d/1rNR2ih7bTH8JaDn218LLq3Gnm-RmLbsidmGRSjMgd68/edit?gid=278290142#gid=278290142',
    'user012': 'https://docs.google.com/spreadsheets/d/1cL34Lm9pmW75ZR27ovJ-yIOJmyTEanA2w0BRbbzRuRo/edit?usp=drive_link',
    'user013': 'https://docs.google.com/spreadsheets/d/1bgcNTllRoe5wkr-b59q7INgat5gZe5Nafkf8O5Y8hz4/edit?usp=drive_link',
    'user014': 'https://docs.google.com/spreadsheets/d/1xAioPzmyWxqzPggIzWjyOClg87beYafDY5QJTz019ik/edit?usp=drive_link',
    'user015': 'https://docs.google.com/spreadsheets/d/1VEKv-aMq0YhnrjmhqhRg8pGhPvOy5LLVxiwd9j3KbYU/edit?usp=drive_link',
    'user016': 'https://docs.google.com/spreadsheets/d/1XwXmdPRWlcqSA3FMjXsyMmBphTB-r6TH8AttE6nMHUE/edit?usp=drive_link',
    'user017': 'https://docs.google.com/spreadsheets/d/1fVSIWhlkYxQHmBDgYzH82RxYhiJ-BrO9pU830yjcj2I/edit?usp=drive_link',
    'user018': 'https://docs.google.com/spreadsheets/d/19WU8Mujw4cQ-YgIwdoVnacNV8x_hzRek-7gnWQtpYjo/edit?usp=drive_link',
    'user019': 'https://docs.google.com/spreadsheets/d/1VhW2O4oAaB2GSU0WAEmVShR0-N13CP-iiHMNR8gma4Y/edit?usp=drive_link',
    'user020': 'https://docs.google.com/spreadsheets/d/1WomWOnaL22hbumL-1fQC8MLlKfMgQmZPL9w5V5q7rc0/edit?usp=drive_link',
    'user021': 'https://docs.google.com/spreadsheets/d/1wbXIhakUnHGspbpChgMzhV6L3OwjjaEs_4iKhXyJ4-A/edit?usp=drive_link',
    'user022': 'https://docs.google.com/spreadsheets/d/1BxyQdwhkMiykKcppmdH_FyRYZxmd_nCvun7_ULUxr8M/edit?usp=drive_link',
    'user023': 'https://docs.google.com/spreadsheets/d/14aTqzde7aBP6ArVxVlbYNG62PQyKzRwUwWXwYbklI1M/edit?usp=drive_link',
    'user024': 'https://docs.google.com/spreadsheets/d/1d7ePkG0865zW7pdqoMKGpNXmcUSsJIqfhz0EOoAdm90/edit?usp=drive_link',
    'user025': 'https://docs.google.com/spreadsheets/d/1YvueZAPsDjVBYjzeor0jnGcfSOv0VucJr1qCnLF7bu4/edit?usp=drive_link'
};
