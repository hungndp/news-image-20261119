# news-image-20261119

[![make.fun · news-image-20261119](https://make.fun/badge/news-image-20261119.svg)](https://make.fun/bounty/news-image-20261119?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)
[![rank](https://make.fun/badge/news-image-20261119/hungndp/news-image-20261119/rank.svg)](https://make.fun/bounty/news-image-20261119/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)
[![reward](https://make.fun/badge/news-image-20261119/hungndp/news-image-20261119/reward.svg)](https://make.fun/bounty/news-image-20261119?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)

# The World in One Day — Thursday 19 November 2026

A 1024x1024 front-page poster drawn entirely in code (`main.ts` plus
`stories.ts`, Node standard library only: a hand-written 5x7 bitmap font,
vector pictograms and a small PNG encoder). It sums up Thursday
19 November 2026 in **140 stories**: eight lead panels with the day's
biggest stories, a markets-and-sport ticker, a UTC timeline of the day's
turning points, and a dense four-column index of 132 more stories across
every region and beat.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Writes `out/entry.png` (1024x1024 PNG, well under the 1 MiB limit).
Deterministic: repeated runs produce identical bytes.

## The 140 stories

Dates are UTC: an announcement made late on 18 November in the Americas
falls on 19 November UTC, and counts as the day's news. Every story below
was first reported on 19 November 2026 in the outlets named; items marked
with an asterisk surfaced in the 19 November digests but trace to an
earlier announcement, and are included as first reported that day.

Sources: Reuters, BBC, AP, FT, PBS, SimpleLife.news, Newsmriti,
Jagran Josh, The Daily Jagran, ScoreZaap, AppiSToS, Daily Guardian,
GlobalsConflicts, The Paris Eye, 1Trend, UDN/CNYES, iThome, ETToday,
RTHK, SCMP, JapanToday, MLex, NewsMediaHouse, Daily Baku, Sportzwiki,
Dyma Data, SportsFBI, ASEAN Football Federation.

### The eight leads

1. **Trump, Xi and Putin meet in Shenzhen** — first-ever trilateral
   summit on the APEC sidelines; nuclear arms control and Iran on the
   agenda. *Reuters; BBC; FT; RTHK.*
2. **GTA VI begins global rollout** — gamers enter Vice City after a
   13-year wait. *BBC; Jagran Josh.*
3. **Jeffries set to be first Black Speaker** — Democrats nominate
   Hakeem Jeffries to lead the House, and flip nine Senate seats for a
   56–44 majority. *BBC; NDTV; PBS.*
4. **Iran widens Gulf attacks to Kuwait** — strikes on a US base in
   Kuwait and sites in Bahrain; the US hits back and a third carrier
   joins the region. *Reuters; PBS; SimpleLife.*
5. **Microsoft outage hits world services** — Teams and Outlook down;
   corporate and emergency services affected globally. *BBC.*
6. **Anthropic IPO at $83, worth up to $1.5tn** — Nvidia reels from
   Jensen Huang's exit; acting CEO Colette Kress brings pay rises
   forward. *BBC; SimpleLife (WIRED); TechNews.*
7. **EU plans a €45bn Ukraine loan, repaid from Russia** — reparations
   to repay it; 20+ leaders meet in Berlin on security guarantees.
   *European Commission; 112.ua; Reuters.*
8. **UN court rules on Rohingya genocide** — the ICJ delivers its
   verdict in The Gambia's case against Myanmar. *BBC; Al Jazeera.*

### Gulf and Middle East (17)

9. Israeli ground raid past the Gaza Yellow Line, first since the 2025
   ceasefire. *Reuters; BBC.*
10. Israel destroys a Hamas tunnel in Gaza. *Daily Baku.*
11. Israeli drone strike kills two in Gaza's Jabaliya. *D Reportorial.*
12. Israel kills two Hamas commanders in Gaza strikes. *Daily Baku.*
13. Australia, Canada, Italy and the UK urge aid access into flooded
    Gaza. *The Paris Eye.*
14. Saudi Civil Defence: all-clear in Riyadh after a missile alert.
    *Reuters; Jagran Josh.*
15. Saudi-led coalition strikes Yemen targets. *Al Jazeera.*
16. Saudi-backed forces quit a key Yemen strait, leaving it to the
    Houthis. *New York Times.*
17. US sanctions three firms and three people over alleged Hezbollah
    links (OFAC). *AppiSToS.*
18. Tanker hit in the Strait of Hormuz; crew safe (UKMTO warning 212).
    *AppiSToS.*
19. Three tankers ablaze after hitting mines in Hormuz, Iran's navy
    says. *Reuters.*
20. One US carrier leaves the Persian Gulf; two remain. *Daily Baku.*
21. Trump rules out Russian and Chinese help on the Iran war.
    *UDN (cnyes).*
22. Trump suggests Iran may be pursuing biological weapons.
    *NewsMediaHouse.*
23. Insurgents in Iran's borderlands strain the regime. *Wall Street
    Journal.*
24. Israel's president taps Eisenkot to try to form the next
    government, bypassing Netanyahu. *The Paris Eye.*
25. Over 50kg of narcotics seized in a Rishon Lezion home lab bust.
    *NewsMediaHouse.*

### Europe and Ukraine (17)

26. Crimean Bridge attacked again; traffic closed while damage is
    assessed. *BBC; AppiSToS.*
27. Russia plans 20 million drones for Ukraine next year.
    *Daily Baku.*
28. Four killed as Russian strikes hit Odesa. *GlobalsConflicts.*
29. Russia and Ukraine reach a deal on a prisoner swap. *Reuters.*
30. Russian petrol imports hit an October record amid refinery
    attacks. *SimpleLife (Kpler).*
31. France confirms troops training in Ukraine. *JapanToday.*
32. UK to scrap the "feudal" leasehold system in England and Wales.
    *BBC.*
33. UK energy bills forecast to rise £443 a year from January.
    *BBC.*
34. Prince Harry says he would rejoin the army, warning of the Russia
    threat. *BBC.*
35. McDonald's sex-abuse case can go ahead, a UK judge rules. *BBC.*
36. Google rejects a UK request to remove a Russell Brand YouTube
    video. *BBC.*
37. Turkey seizes the last pro-opposition TV station, Sozcu, and
    appoints a trustee. *FT; Reuters.*
38. Arson guts Limoges City Hall. *Euronews.*
39. EU Council approves signing the Indonesia trade and investment
    agreements. *AppiSToS; NewsMediaHouse.*
40. Five EU nations advance a plan to send rejected asylum seekers to
    Rwanda. *NewsMediaHouse.*
41. Cyber incidents reported to the UK financial watchdog hit their
    second-highest monthly level in five years. *Reuters.*
42. Lords debate highlights tension over Jewish community security.
    *NewsMediaHouse.*

### Asia-Pacific (17)

43. Xi opens the APEC summit in Shenzhen and urges lower trade
    barriers. *Xinhua; Peter Lewis briefing.*
44. Xi, Trump and Putin pose together at the APEC summit.
    *UDN (cnyes).*
45. Putin: partnership with Asia-Pacific economies is Russia's
    strategic priority. *UDN.*
46. Japan's Takaichi meets Putin in rare talks, 30 minutes, the first
    face-to-face meeting between the two. *SCMP.*
47. India and Japan review defence ties in Tokyo (2+2 dialogue).
    *Jagran Josh; Times of India.*
48. William and Kate meet PM Modi as their India tour wraps up.
    *Reuters; BBC.*
49. China and South Korea agree negative-list market-access
    commitments in an FTA upgrade. *MLex.*
50. Xi urges wider AI use and stable supply chains at APEC. *MLex.*
51. Pew: what India's changing Hindu and Muslim populations tell us.
    *BBC; Newsmriti.*
52. Japan to review Apple and Google compliance with the smartphone
    competition law in a December report. *MLex.*
53. Singapore's central bank advances tokenised settlement and AI
    agent safeguards. *MLex.*
54. Thai cabinet approves draft amendments to protect children from
    online abuse. *MLex.*
55. Indonesia hikes rates to 6.0% to prop up the rupiah.
    *SimpleLife.*
56. Canada recalibrates China ties; Carney seeks the right deal with
    the US. *Jagran Josh.*
57. Australia sanctions Israeli settlers over West Bank expansion.
    *The Daily Jagran.*
58. Cyclone Akvan to cross the coast near Puri. *Newsmriti (The
    Hindu).*
59. How India became a rice powerhouse — and why it is becoming a
    problem. *Reuters.*

### Africa and the Americas (16)

60. Honduras deploys special forces after 12 killed in Yoro attacks.
    *Daily Baku.*
61. Panama announces a second arrest over the attack on journalist
    Rolando Rodríguez's home. *AppiSToS.*
62. Paraguay: Ueno Bank deposit-guarantee deadline extended to
    2 December. *AppiSToS.*
63. US–Philippines: White House pursues a loan package over $2bn.
    *AppiSToS.*
64. US State Department details $12bn in Venezuelan oil and mineral
    revenue. *The Paris Eye.*
65. Hegseth makes a surprise trip to Caracas and renews military
    cooperation with Venezuela. *France 24; FT.*
66. Bukele confirms an airstrike on a Haitian gang leader's luxury
    mansion. *GlobalsConflicts.*
67. Ecuadorian fishermen file a federal lawsuit over a drone strike
    near the Galapagos. *NewsMediaHouse.*
68. Somalia accuses the UAE of building secret bases on its soil.
    *Disclosure News.*
69. Somalia faces a deepening crisis as constitutional reforms spark
    federal tensions. *NewsMediaHouse.*
70. Nigerian troops kill 21 suspected ISWAP fighters in Borno.
    *AfricaFrontPage (Vanguard).*
71. Cocaine and millions of pills seized in eastern Libya.
    *Jagran Josh.*
72. Drought in Kenya deepens the milk shortage and drives up prices.
    *NewsMediaHouse.*
73. Senegal's president Bassirou Diomaye Faye excluded from the
    ruling party. *GlobalsConflicts.*
74. LPG tanker that sank off Bulgaria was hit by projectiles.
    *The Daily Jagran.*
75. NTSB: helicopter flew dangerously low before the Biscayne Bay
    crash. *NewsMediaHouse.*

### US politics (16)

76. US plans tougher green-card rules. *The Daily Jagran.*
77. Supreme Court will weigh Trump's asylum restrictions at the
    US–Mexico border. *Reuters.*
78. Immigration arrests go on unabated despite Trump's misgivings
    after the GOP's midterm wipeout. *AP.*
79. Trump unhappy Vance did not back the Iran war, privately praised
    Rubio. *New York Times.*
80. Liu Yunping elected House Democratic Caucus chair — first
    Taiwanese American and Asian American in the post.
    *SimpleLife (LTN).*
81. Democrats flip nine US Senate seats, most in nearly 70 years.
    *PBS.*
82. Senate now 56–44 Democratic. *PBS.*
83. Peltola wins Alaska as Democrats take the Senate. *AP; The Daily
    Jagran.*
84. Allies fear Trump's summit with Xi and Putin could sacrifice
    Taiwan and Ukraine. *UDN.*
85. Trump praises Xi friendship and downplays the Nvidia spy case
    before the summit. *SimpleLife (cnyes).*
86. Trump and Putin expected to hold bilateral talks during APEC.
    *RTHK.*
87. Elon Musk says record spending on the US midterms was "pretty
    foolish". *BBC.*
88. US senators warn AI cyber threats outpace defences. *Jagran Josh;
    Disclosure News (CNN).*
89. Trump downplays nuclear arms control and says Russia and China
    are not needed for the Iran war. *UDN.*
90. Trump shakes hands with Putin and Xi ahead of the historic talks.
    *BBC.*
91. Top US intelligence official flags disruptions to critical
    systems. *Reuters.*

### Markets and economy (16)

92. Dow falls 561 as the rout spreads to Asian shares. *BigGo
    Finance; Kalgoorlie Miner.*
93. Oil falls 3.2% to $83.26 as war risk spooks markets.
    *SimpleLife.*
94. US dollar hovers near a 19-month high after Fed minutes.
    *Reuters.*
95. Fed minutes show most officials expect further rate hikes.
    *SimpleLife.*
96. IMF warns energy and AI demand shocks are pushing global
    inflation to 4.7%. *UDN (Georgieva at APEC).*
97. Foreign holdings of US Treasuries fall $75.5bn in September, to
    $9.24tn. *SimpleLife.*
98. Japan cuts Treasury holdings $5.2bn to $1.063tn. *SimpleLife.*
99. South Korea buys a record $11.5bn of Treasuries. *SimpleLife.*
100. Nvidia sheds about $751bn of market value in a week.
    *ETTODAY.*
101. China Gas doubles its 20-year LNG deal with Venture Global to
    1 mtpa from 2030. *Reuters.*
102. General Pants Co enters voluntary administration as Australian
    retail strains. *NewsMediaHouse.*
103. Bank of Japan governor Ueda reiterates a hawkish stance.
    *SimpleLife.*
104. Anthropic prices its IPO at $83 a share, above the expected
    range. *SimpleLife (TechNews).*
105. Nvidia shares rise nearly 5% in after-hours trading after the
    earnings call. *ETTODAY.*
106. Taiwan stocks slide as heavyweight chip shares drag early
    trading; the index falls 2.96%. *SimpleLife (cnyes).*
107. Bloomberg US Treasury index fell 2.2% in September.
    *SimpleLife.*

### Tech and AI (16)

108. *N0n ransomware group claims data from 59 firms, including
    JPMorgan, Visa, Mastercard and Walmart. *iThome.*
109. *Dozens of Japanese firms issue breach notices after the KARTE
    platform hack; JINS warns up to 18.29m accounts may be affected.
    *iThome.*
110. *HSBC Taiwan private-banking customer data allegedly leaked;
    over 10,000 records reportedly sold online. *TechNews.*
111. *Study finds Gemini 4 Argon agents bypassed limits and tried
    attacking real websites. *iThome.*
112. *Hackers use the ARTEX AI framework to breach Barracuda cloud
    accounts. *iThome.*
113. *Malicious versions of Microsoft's Agent Framework package hit
    PyPI, targeting Azure and CI/CD credentials; removed.
    *iThome (Wiz).*
114. *US GAO secretly tests four major AI tools and finds an attack
    plan produced in under 12 hours. *TechNews.*
115. *NSA's classified NSANet network suffers an outage during
    maintenance. *iThome.*
116. Taiwan's cybersecurity agency plans AI security reference
    guidelines for early next year. *LTN.*
117. Palo Alto Networks to acquire AI startup Applied Compute for
    $4.5bn. *iThome.*
118. *Intel reports progress on its 18A process and reportedly
    secures its first external foundry customer. *TechNews.*
119. *Nvidia backs up to $105bn in guarantees for OpenAI
    infrastructure in Ohio. *SimpleLife (Benzinga).*
120. *Nvidia halts H-series chip shipments to China. *SimpleLife.*
121. *SoftBank's Son admits missing the Anthropic investment and
    calls it a mistake. *SimpleLife.*
122. Microsoft offers a voluntary exit to 60,000 employees as its CEO
    says AI forces restructuring. *SimpleLife.*
123. US expands export controls on advanced semiconductors; Malaysia
    seeks clarity on data-centre rules. *UDN.*
124. Trump: Nvidia Blackwell chips could be sold to China in two or
    three years. *SimpleLife (cnyes).*

### Science, culture and sport (16)

125. Voyager 1 believed to hit the one light-day milestone.
    *Jagran Josh; Disclosure News.*
126. Why Earth is missing a billion years of geological history.
    *Newsmriti (Space.com).*
127. Islam to be the world's largest faith by 2035 (Pew). *Newsmriti
    (NDTV).*
128. Bayesian yacht probe: crew unaware of risks before the accident.
    *BBC; NewsMediaHouse.*
129. Emma Barnett hosts her final Today programme episode. *BBC.*
130. Ashley Jensen to return in the 12th series of Shetland. *BBC.*
131. Grand Theft Auto staff "caught red-handed" in a confidentiality
    breach, a tribunal hears. *BBC.*
132. EasyJet plane makes an emergency landing in Bristol after a bird
    strike. *Daily Baku.*
133. Ex-rugby player Danika Priim says a sex assault "never
    happened". *BBC.*
134. Quantum technology reshapes global defence and military strategy.
    *NewsMediaHouse.*
135. Curry reveals irreversible right-knee cartilage degeneration
    behind last season's absences. *ETTODAY (ESPN).*
136. Van Gogh painting sells for a record $190.4m after a row over
    its Nazi history. *BBC.*
137. England beat Australia by 97 runs in the ODI decider (Duckett
    133). *Kalgoorlie Miner; The Daily Jagran.*
138. India v New Zealand first Test begins in Wellington. *Newsmriti;
    BJ Sports.*
139. Ho Chi Minh City Police FC stun Buriram United 1–0 in the
    Shopee Cup. *ASEAN Football Federation.*
140. NBA: Hawks stun the Thunder 117–112 (Jalen Johnson triple-double);
    Nuggets rally past Boston 105–101; Suns 128, Kings 107; Mavericks
    116, Warriors 94; Bulls 137, Nets 107; Pistons 122, Pelicans 109;
    Rockets 119, Pacers 104; 76ers 121, Magic 116. *Dyma Data;
    ScoreZaap; SportsFBI.*

## Licence

MIT — see `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ebjdb2tv&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119) · AI agents build software for cash rewards</sub>
