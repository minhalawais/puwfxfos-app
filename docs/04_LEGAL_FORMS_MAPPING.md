# Legal Forms Mapping

This document maps official PUWF/legal assets into mobile app modules. The OCR in some extracted markdown is noisy, so implementation should use the formal PRD/SRS/ERD/OpenAPI fields as structured truth and the official PDFs/assets as terminology and document-fidelity anchors.

## Form C: Worker Membership

Mobile module: Worker onboarding, Union Admin member create/edit.

Required mobile fields:
- Worker full name, father name, CNIC, date of birth, gender, mobile number.
- Permanent/current address, district, province.
- Establishment name, employer name, department, designation, trade, employment date, employment type.
- Union join date, monthly subscription, membership status.
- EOBI number, social security number, WWF eligibility, provident fund/gratuity status where known.
- Signature/thumb/document placeholders for later upload.

Validation:
- CNIC must be 13 digits after removing dashes.
- Mobile number must match Pakistan mobile format.
- Worker should be at least 18 years old unless policy explicitly allows exception.

## Form A: Union Registration

Mobile module: Future PUWF/admin; read-only reference for union-admin profile completeness.

Key fields:
- Union name, Urdu name, registration number/date/province.
- Establishment, employer, industry/sector, union address.
- Legal status, affiliation status, CBA status, member counts.

## Form A Schedule 1: Office Bearers

Mobile module: Union Admin office bearers.

Fields:
- Name, CNIC, designation, appointment date, term expiry, phone, gender, outsider flag, status.
- Enforce or warn when outsiders approach the 25% executive-body limit.

## Annual Return

Mobile module: Union Admin annual return wizard.

Sections:
- Fiscal year and member count movement.
- Male/female counts.
- Income: subscription, entrance fee, special levy, donation, interest, other income.
- Expenses: salary, rent, legal, travel, stationery, communication, welfare, affiliation fee, other expenses.
- Balance sheet: opening balance, closing balance, cash, bank, assets, investments, dues outstanding, liabilities.
- Approval: General Secretary review and Finance Secretary review before submission.

## NGC Nomination And Elections

Mobile module: Worker voting, Union Admin elections.

Fields:
- Election title/type, polling date/time, nomination deadline, objection deadline.
- Candidate name, CNIC, position, manifesto/status.
- Voter eligibility, OTP verification placeholder, ballot confirmation.

## Resolution And Khalfiya Biyan

Mobile module: Union Admin documents and affiliation packet.

Fields:
- Document title, union name, meeting date, president/general secretary names, affidavit status, uploaded document status.

## Members List

Mobile module: Union Admin member registry and bulk import reference.

Fields:
- Serial number, member name, father name, CNIC, designation, posting place/address, joining date.

## CBA And Charter Of Demand

Mobile module: Union Admin CBA/CoD.

Fields:
- CBA certificate number, establishment, effective date, expiry date, RTU/NIRC issuer, status.
- CoD reference, demand list, current stage, management response, conciliation officer, strike notice date, settlement date, MoS document.

