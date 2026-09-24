/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UpazilaLocation {
  name: string;
  nameBn?: string;
  zilla: string;
  division: string;
  lat: number;
  lon: number;
  elevationM: number;
  terrainType: 'urban_delta' | 'haor_wetland' | 'coastal_estuary' | 'alluvial_plain' | 'hilly_tract';
  primaryHazards: string[];
  vulnerabilitySummary: string;
  canalOrRiver: string;
  criticalFacilities: {
    hospital: string;
    fireStation: string;
    shelterOrHub: string;
  };
  sampleCorridors: {
    name: string;
    type: 'arterial' | 'expressway' | 'collector';
    baseCongestion: 'FREE_FLOW' | 'MODERATE' | 'CONGESTED' | 'SEVERE';
    floodVulnerability: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
}

export interface ZillaData {
  name: string;
  nameBn?: string;
  division: string;
  lat: number;
  lon: number;
  upazilas: UpazilaLocation[];
}

export interface DivisionData {
  name: string;
  nameBn?: string;
  zillas: ZillaData[];
}

/**
 * Raw administrative mapping of all 8 Divisions, 64 Districts (Zillas),
 * and comprehensive Upazilas / Thanas of Bangladesh.
 */
interface DistrictMeta {
  division: string;
  lat: number;
  lon: number;
  elevationM: number;
  terrainType: UpazilaLocation['terrainType'];
  canalOrRiver: string;
  upazilas: string[];
}

export const BANGLADESH_ADMIN_DATA: Record<string, DistrictMeta> = {
  // --- DHAKA DIVISION (13 Districts) ---
  'Dhaka': {
    division: 'Dhaka',
    lat: 23.8103,
    lon: 90.4125,
    elevationM: 8,
    terrainType: 'urban_delta',
    canalOrRiver: 'Buriganga, Turag & Balu Rivers',
    upazilas: [
      'Mirpur', 'Mohammadpur', 'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Tejgaon',
      'Motijheel', 'Shahbagh', 'Ramna', 'Paltan', 'Lalbagh', 'Sutrapur', 'Kotwali',
      'Wari', 'Demra', 'Jatrabari', 'Khilgaon', 'Rampura', 'Badda', 'Vatara',
      'Hazaribagh', 'Kamrangirchar', 'Keraniganj', 'Savar', 'Dhamrai', 'Dohar', 'Nawabganj',
      'Cantonment', 'Kafrul', 'Pallabi', 'Turag', 'Khilkhet', 'Dakshinkhan', 'Uttarkhan',
      'New Market', 'Chawkbazar', 'Shah Ali', 'Darus Salam', 'Rupnagar', 'Bhashantek',
      'Kadamtali', 'Shyampur', 'Mugda', 'Bangshal', 'Hatirjheel', 'Adabor',
      'Sher-e-Bangla Nagar', 'Kalabagan', 'Sabujbagh', 'Gandaria'
    ]
  },
  'Gazipur': {
    division: 'Dhaka',
    lat: 24.0023,
    lon: 90.4264,
    elevationM: 14,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Turag & Balu Rivers',
    upazilas: ['Gazipur Sadar', 'Tongi', 'Kaliakair', 'Sreepur', 'Kapasia', 'Kaliganj']
  },
  'Narayanganj': {
    division: 'Dhaka',
    lat: 23.6238,
    lon: 90.5000,
    elevationM: 6,
    terrainType: 'urban_delta',
    canalOrRiver: 'Shitalakshya River',
    upazilas: ['Narayanganj Sadar', 'Bandar', 'Fatullah', 'Siddhirganj', 'Rupganj', 'Araihazar', 'Sonargaon']
  },
  'Narsingdi': {
    division: 'Dhaka',
    lat: 23.9322,
    lon: 90.7154,
    elevationM: 12,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Meghna & Arial Kha Rivers',
    upazilas: ['Narsingdi Sadar', 'Palash', 'Belabo', 'Monohardi', 'Raipura', 'Shibpur']
  },
  'Munshiganj': {
    division: 'Dhaka',
    lat: 23.5422,
    lon: 90.5305,
    elevationM: 5,
    terrainType: 'urban_delta',
    canalOrRiver: 'Padma & Meghna Rivers',
    upazilas: ['Munshiganj Sadar', 'Sreenagar', 'Sirajdikhan', 'Louhajang', 'Tongibari', 'Gazaria']
  },
  'Manikganj': {
    division: 'Dhaka',
    lat: 23.8617,
    lon: 90.0003,
    elevationM: 9,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Dhaleshwari & Kaliganga Rivers',
    upazilas: ['Manikganj Sadar', 'Singair', 'Shibalaya', 'Saturia', 'Harirampur', 'Ghior', 'Daulatpur']
  },
  'Tangail': {
    division: 'Dhaka',
    lat: 24.2513,
    lon: 89.9167,
    elevationM: 15,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Jamuna & Louhajang Rivers',
    upazilas: ['Tangail Sadar', 'Mirzapur', 'Kalihati', 'Ghatail', 'Sakhipur', 'Gopalpur', 'Madhupur', 'Delduar', 'Nagarpur', 'Bhuapur', 'Dhanbari', 'Basail']
  },
  'Kishoreganj': {
    division: 'Dhaka',
    lat: 24.4449,
    lon: 90.7766,
    elevationM: 11,
    terrainType: 'haor_wetland',
    canalOrRiver: 'Narasunda & Old Brahmaputra Rivers',
    upazilas: ['Kishoreganj Sadar', 'Bhairab', 'Bajitpur', 'Karimganj', 'Katiadi', 'Kuliarchar', 'Pakundia', 'Hossainpur', 'Tarail', 'Itna', 'Mithamain', 'Ashtagram', 'Nikli']
  },
  'Faridpur': {
    division: 'Dhaka',
    lat: 23.6071,
    lon: 89.8429,
    elevationM: 10,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Padma & Kumar Rivers',
    upazilas: ['Faridpur Sadar', 'Boalmari', 'Alfadanga', 'Madhukhali', 'Bhanga', 'Nagarkanda', 'Charbhadrasan', 'Sadarpur', 'Saltha']
  },
  'Gopalganj': {
    division: 'Dhaka',
    lat: 23.0051,
    lon: 89.8266,
    elevationM: 6,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Madhumati River',
    upazilas: ['Gopalganj Sadar', 'Tungipara', 'Kotalipara', 'Kashiani', 'Muksudpur']
  },
  'Madaripur': {
    division: 'Dhaka',
    lat: 23.1641,
    lon: 90.1897,
    elevationM: 7,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Arial Kha & Kumar Rivers',
    upazilas: ['Madaripur Sadar', 'Shibchar', 'Kalkini', 'Rajoir', 'Dasar']
  },
  'Rajbari': {
    division: 'Dhaka',
    lat: 23.7574,
    lon: 89.6445,
    elevationM: 12,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Padma & Gorai Rivers',
    upazilas: ['Rajbari Sadar', 'Goalanda', 'Pangsha', 'Baliakandi', 'Kalukhali']
  },
  'Shariatpur': {
    division: 'Dhaka',
    lat: 23.2423,
    lon: 90.4348,
    elevationM: 6,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Padma & Meghna Rivers',
    upazilas: ['Shariatpur Sadar', 'Naria', 'Zajira', 'Bhedarganj', 'Damudya', 'Gosairhat']
  },

  // --- CHATTOGRAM DIVISION (11 Districts) ---
  'Chattogram': {
    division: 'Chattogram',
    lat: 22.3569,
    lon: 91.7832,
    elevationM: 9,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Karnaphuli River & Chaktai Khal',
    upazilas: [
      'Kotwali', 'Panchlaish', 'Agrabad', 'Double Mooring', 'Halishahar', 'Pahartali',
      'Khulshi', 'Chandgaon', 'Bakalia', 'Patenga', 'Bayezid', 'Bandar', 'Sadarghat',
      'Karnafuli', 'Hathazari', 'Raozan', 'Rangunia', 'Sitakunda', 'Mirsharai',
      'Boalkhali', 'Patiya', 'Anwara', 'Chandanaish', 'Satkania', 'Lohagara',
      'Banshkhali', 'Sandwip', 'Fatikchhari'
    ]
  },
  "Cox's Bazar": {
    division: 'Chattogram',
    lat: 21.4272,
    lon: 92.0058,
    elevationM: 5,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Bakkhali River & Bay of Bengal',
    upazilas: ["Cox's Bazar Sadar", 'Ramu', 'Chakaria', 'Pekua', 'Kutubdia', 'Maheshkhali', 'Ukhia', 'Teknaf', 'Eidgaon']
  },
  'Cumilla': {
    division: 'Chattogram',
    lat: 23.4607,
    lon: 91.1809,
    elevationM: 14,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Gumti River',
    upazilas: [
      'Cumilla Sadar', 'Cumilla Sadar Dakshin', 'Daudkandi', 'Chandina', 'Debidwar',
      'Homna', 'Muradnagar', 'Burichang', 'Brahmanpara', 'Laksam', 'Chauddagram',
      'Nangalkot', 'Barura', 'Titas', 'Monohargonj', 'Meghna', 'Lalmai'
    ]
  },
  'Feni': {
    division: 'Chattogram',
    lat: 23.0186,
    lon: 91.3966,
    elevationM: 8,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Feni & Muhuri Rivers',
    upazilas: ['Feni Sadar', 'Daganbhuiyan', 'Chhagalnaiya', 'Sonagazi', 'Parshuram', 'Fulgazi']
  },
  'Brahmanbaria': {
    division: 'Chattogram',
    lat: 23.9571,
    lon: 91.1119,
    elevationM: 10,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Titas & Meghna Rivers',
    upazilas: ['Brahmanbaria Sadar', 'Kasba', 'Akhaura', 'Nabinagar', 'Bancharampur', 'Sarail', 'Nasirnagar', 'Ashuganj', 'Bijoynagar']
  },
  'Noakhali': {
    division: 'Chattogram',
    lat: 22.8696,
    lon: 91.0998,
    elevationM: 6,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Meghna Estuary',
    upazilas: ['Noakhali Sadar (Sudharam)', 'Begumganj', 'Chatkhil', 'Senbagh', 'Companiganj', 'Hatiya', 'Subarnachar', 'Kabirhat', 'Sonaimuri']
  },
  'Lakshmipur': {
    division: 'Chattogram',
    lat: 22.9425,
    lon: 90.8412,
    elevationM: 6,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Meghna & Dakatia Rivers',
    upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar']
  },
  'Chandpur': {
    division: 'Chattogram',
    lat: 23.2333,
    lon: 90.6667,
    elevationM: 7,
    terrainType: 'urban_delta',
    canalOrRiver: 'Padma, Meghna & Dakatia Confluence',
    upazilas: ['Chandpur Sadar', 'Hajiganj', 'Faridganj', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti', 'Kachua', 'Haimchar']
  },
  'Khagrachhari': {
    division: 'Chattogram',
    lat: 23.1193,
    lon: 91.9847,
    elevationM: 45,
    terrainType: 'hilly_tract',
    canalOrRiver: 'Chengi & Maini Rivers',
    upazilas: ['Khagrachhari Sadar', 'Dighinala', 'Panchhari', 'Mahalchhari', 'Matiranga', 'Manikchhari', 'Ramgarh', 'Guimara', 'Lakshmichhari']
  },
  'Rangamati': {
    division: 'Chattogram',
    lat: 22.6574,
    lon: 92.1733,
    elevationM: 30,
    terrainType: 'hilly_tract',
    canalOrRiver: 'Kaptai Lake & Karnaphuli River',
    upazilas: ['Rangamati Sadar', 'Kaptai', 'Kawkhali', 'Baghaichhari', 'Barkal', 'Langadu', 'Rajasthali', 'Belaichhari', 'Jurachhari', 'Naniarchar']
  },
  'Bandarban': {
    division: 'Chattogram',
    lat: 22.1953,
    lon: 92.2184,
    elevationM: 60,
    terrainType: 'hilly_tract',
    canalOrRiver: 'Sangu & Matamuhuri Rivers',
    upazilas: ['Bandarban Sadar', 'Ruma', 'Thanchi', 'Rowangchhari', 'Lama', 'Alikadam', 'Naikhongchhari']
  },

  // --- SYLHET DIVISION (4 Districts) ---
  'Sylhet': {
    division: 'Sylhet',
    lat: 24.8949,
    lon: 91.8687,
    elevationM: 15,
    terrainType: 'haor_wetland',
    canalOrRiver: 'Surma & Kushiyara Rivers',
    upazilas: [
      'Sylhet Sadar', 'Kotwali', 'Shah Poran', 'Dakshin Surma', 'Beanibazar', 'Golapganj',
      'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Zakiganj', 'Balaganj', 'Fenchuganj',
      'Bishwanath', 'Companiganj', 'Osmaninagar'
    ]
  },
  'Sunamganj': {
    division: 'Sylhet',
    lat: 25.0658,
    lon: 91.3950,
    elevationM: 8,
    terrainType: 'haor_wetland',
    canalOrRiver: 'Surma River & Tanguar Haor',
    upazilas: [
      'Sunamganj Sadar', 'Chhatak', 'Jagannathpur', 'Derai', 'Dharamapasha', 'Tahirpur',
      'Bishwamvarpur', 'Jamalganj', 'Shalla', 'Dowarabazar', 'Madhyanagar', 'Shantiganj'
    ]
  },
  'Moulvibazar': {
    division: 'Sylhet',
    lat: 24.4829,
    lon: 91.7774,
    elevationM: 18,
    terrainType: 'hilly_tract',
    canalOrRiver: 'Manu & Dhalai Rivers',
    upazilas: ['Moulvibazar Sadar', 'Sreemangal', 'Kamalganj', 'Kulaura', 'Barlekha', 'Juri', 'Rajnagar']
  },
  'Habiganj': {
    division: 'Sylhet',
    lat: 24.3749,
    lon: 91.4155,
    elevationM: 12,
    terrainType: 'haor_wetland',
    canalOrRiver: 'Khowai & Korangi Rivers',
    upazilas: ['Habiganj Sadar', 'Nabiganj', 'Madhabpur', 'Chunarughat', 'Bahubal', 'Baniachong', 'Ajmiriganj', 'Lakhai', 'Shayestaganj']
  },

  // --- RAJSHAHI DIVISION (8 Districts) ---
  'Rajshahi': {
    division: 'Rajshahi',
    lat: 24.3636,
    lon: 88.6241,
    elevationM: 19,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Padma River',
    upazilas: [
      'Boalia', 'Rajpara', 'Motihar', 'Shah Makhdum', 'Chandrima', 'Kashiadanga',
      'Katakhali', 'Belpukur', 'Paba', 'Durgapur', 'Puthia', 'Bagmara', 'Charghat',
      'Bagha', 'Tanore', 'Mohanpur', 'Godagari'
    ]
  },
  'Bogura': {
    division: 'Rajshahi',
    lat: 24.8465,
    lon: 89.3777,
    elevationM: 20,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Karatoa & Jamuna Rivers',
    upazilas: ['Bogura Sadar', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Gabtali', 'Dhunat', 'Sariakandi', 'Sonatola', 'Kahaloo', 'Nandigram', 'Adamdighi', 'Dupchanchia']
  },
  'Pabna': {
    division: 'Rajshahi',
    lat: 24.0044,
    lon: 89.2372,
    elevationM: 16,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Padma & Ichamati Rivers',
    upazilas: ['Pabna Sadar', 'Ishwardi', 'Santhia', 'Bera', 'Sujanagar', 'Chatmohar', 'Bhangura', 'Faridpur', 'Atgharia']
  },
  'Sirajganj': {
    division: 'Rajshahi',
    lat: 24.4534,
    lon: 89.7008,
    elevationM: 15,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Jamuna River',
    upazilas: ['Sirajganj Sadar', 'Shahjadpur', 'Ullapara', 'Belkuchi', 'Kazipur', 'Kamarkhanda', 'Raiganj', 'Tarash', 'Chauhali']
  },
  'Naogaon': {
    division: 'Rajshahi',
    lat: 24.7936,
    lon: 88.9318,
    elevationM: 22,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Atrai & Jamuna Rivers',
    upazilas: ['Naogaon Sadar', 'Mohadevpur', 'Manda', 'Patnitala', 'Dhamoirhat', 'Badalgachhi', 'Raninagar', 'Atrai', 'Porsha', 'Sapahar', 'Niamatpur']
  },
  'Natore': {
    division: 'Rajshahi',
    lat: 24.4206,
    lon: 88.9324,
    elevationM: 16,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Baral River & Chalan Beel',
    upazilas: ['Natore Sadar', 'Singra', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Bagatipara', 'Naldanga']
  },
  'Chapai Nawabganj': {
    division: 'Rajshahi',
    lat: 24.5965,
    lon: 88.2775,
    elevationM: 24,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Mahananda & Padma Rivers',
    upazilas: ['Chapai Nawabganj Sadar', 'Shibganj', 'Gomastapur', 'Nachole', 'Bholahat']
  },
  'Joypurhat': {
    division: 'Rajshahi',
    lat: 25.1015,
    lon: 89.0277,
    elevationM: 27,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Chiri & Little Jamuna Rivers',
    upazilas: ['Joypurhat Sadar', 'Panchbibi', 'Kalai', 'Khetlal', 'Akkelpur']
  },

  // --- KHULNA DIVISION (10 Districts) ---
  'Khulna': {
    division: 'Khulna',
    lat: 22.8456,
    lon: 89.5403,
    elevationM: 3,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Rupsha & Bhairab Rivers',
    upazilas: [
      'Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Khan Jahan Ali', 'Harintana',
      'Aranghata', 'Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha',
      'Phultala', 'Rupsha', 'Terokhada'
    ]
  },
  'Jashore': {
    division: 'Khulna',
    lat: 23.1664,
    lon: 89.2081,
    elevationM: 7,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Bhairab & Kapotaksha Rivers',
    upazilas: ['Jashore Sadar', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Sharsha']
  },
  'Satkhira': {
    division: 'Khulna',
    lat: 22.7185,
    lon: 89.0705,
    elevationM: 2,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Kholpetua River & Sundarbans Estuary',
    upazilas: ['Satkhira Sadar', 'Shyamnagar', 'Ashashuni', 'Kaliganj', 'Tala', 'Kalaroa', 'Debhata']
  },
  'Kushtia': {
    division: 'Khulna',
    lat: 23.9013,
    lon: 89.1205,
    elevationM: 14,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Padma & Gorai Rivers',
    upazilas: ['Kushtia Sadar', 'Kumarkhali', 'Mirpur', 'Bheramara', 'Daulatpur', 'Khoksa']
  },
  'Jhenaidah': {
    division: 'Khulna',
    lat: 23.5450,
    lon: 89.1726,
    elevationM: 12,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Nabaganga & Kumar Rivers',
    upazilas: ['Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa', 'Harinakundu']
  },
  'Bagerhat': {
    division: 'Khulna',
    lat: 22.6516,
    lon: 89.7859,
    elevationM: 3,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Pashur & Baleshwar Rivers',
    upazilas: ['Bagerhat Sadar', 'Mongla', 'Rampal', 'Morrelganj', 'Sarankhola', 'Fakirhat', 'Kachua', 'Chitalmari', 'Mollahat']
  },
  'Chuadanga': {
    division: 'Khulna',
    lat: 23.6402,
    lon: 88.8418,
    elevationM: 15,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Mathabhanga River',
    upazilas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar']
  },
  'Meherpur': {
    division: 'Khulna',
    lat: 23.7622,
    lon: 88.6318,
    elevationM: 16,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Bhairab & Mathabhanga Rivers',
    upazilas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar']
  },
  'Magura': {
    division: 'Khulna',
    lat: 23.4873,
    lon: 89.4198,
    elevationM: 10,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Gorai & Nabaganga Rivers',
    upazilas: ['Magura Sadar', 'Sreepur', 'Mohammadpur', 'Shalikha']
  },
  'Narail': {
    division: 'Khulna',
    lat: 23.1725,
    lon: 89.5127,
    elevationM: 8,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Chitra & Nabaganga Rivers',
    upazilas: ['Narail Sadar', 'Lohagara', 'Kalia']
  },

  // --- BARISHAL DIVISION (6 Districts) ---
  'Barishal': {
    division: 'Barishal',
    lat: 22.7010,
    lon: 90.3535,
    elevationM: 3,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Kirtankhola & Arial Kha Rivers',
    upazilas: [
      'Barishal Sadar', 'Kotwali', 'Airport', 'Kawnia', 'Bandar', 'Bakerganj',
      'Babuganj', 'Wazirpur', 'Banaripara', 'Gournadi', 'Agailjhara', 'Mehendiganj',
      'Muladi', 'Hizla'
    ]
  },
  'Patuakhali': {
    division: 'Barishal',
    lat: 22.3596,
    lon: 90.3299,
    elevationM: 2,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Lauhajang & Andharmanik Rivers',
    upazilas: ['Patuakhali Sadar', 'Galachipa', 'Kalapara', 'Bauphal', 'Dashmina', 'Dumki', 'Mirzaganj', 'Rangabali']
  },
  'Bhola': {
    division: 'Barishal',
    lat: 22.6859,
    lon: 90.6481,
    elevationM: 3,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Meghna & Tetulia Rivers',
    upazilas: ['Bhola Sadar', 'Borhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin']
  },
  'Pirojpur': {
    division: 'Barishal',
    lat: 22.5841,
    lon: 89.9720,
    elevationM: 3,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Baleshwar & Sandha Rivers',
    upazilas: ['Pirojpur Sadar', 'Mathbaria', 'Bhandaria', 'Nesarabad (Swarupkati)', 'Nazirpur', 'Kawkhali', 'Zianagar (Indurkani)']
  },
  'Barguna': {
    division: 'Barishal',
    lat: 22.1570,
    lon: 90.1264,
    elevationM: 2,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Payra & Bishkhali Rivers',
    upazilas: ['Barguna Sadar', 'Amtali', 'Patharghata', 'Betagi', 'Bamna', 'Taltali']
  },
  'Jhalokati': {
    division: 'Barishal',
    lat: 22.6406,
    lon: 90.1987,
    elevationM: 4,
    terrainType: 'coastal_estuary',
    canalOrRiver: 'Sugandha & Bishkhali Rivers',
    upazilas: ['Jhalokati Sadar', 'Nalchity', 'Rajapur', 'Kathalia']
  },

  // --- RANGPUR DIVISION (8 Districts) ---
  'Rangpur': {
    division: 'Rangpur',
    lat: 25.7439,
    lon: 89.2752,
    elevationM: 34,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Ghaghat & Teesta Rivers',
    upazilas: ['Rangpur Sadar', 'Kotwali', 'Tajhat', 'Mahiganj', 'Haragach', 'Parshuram', 'Hazirhat', 'Badarganj', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Kaunia', 'Gangachhara', 'Taraganj']
  },
  'Dinajpur': {
    division: 'Rangpur',
    lat: 25.6217,
    lon: 88.6355,
    elevationM: 38,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Punarbhaba & Dhepa Rivers',
    upazilas: ['Dinajpur Sadar', 'Birganj', 'Kaharole', 'Bochaganj', 'Birol', 'Parbatipur', 'Fulbari', 'Nawabganj', 'Ghoraghat', 'Hakimpur', 'Birampur', 'Khansama', 'Chirirbandar']
  },
  'Kurigram': {
    division: 'Rangpur',
    lat: 25.8054,
    lon: 89.6362,
    elevationM: 30,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Dharla, Brahmaputra & Teesta Rivers',
    upazilas: ['Kurigram Sadar', 'Nageshwari', 'Bhurungamari', 'Phulbari', 'Rajarhat', 'Ulipur', 'Chilmari', 'Rowmari', 'Char Rajibpur']
  },
  'Gaibandha': {
    division: 'Rangpur',
    lat: 25.3288,
    lon: 89.5404,
    elevationM: 26,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Ghaghat & Jamuna Rivers',
    upazilas: ['Gaibandha Sadar', 'Gobindaganj', 'Sundarganj', 'Saghata', 'Palashbari', 'Sadullapur', 'Phulchhari']
  },
  'Nilphamari': {
    division: 'Rangpur',
    lat: 25.9318,
    lon: 88.8560,
    elevationM: 40,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Teesta & Buritiesta Rivers',
    upazilas: ['Nilphamari Sadar', 'Saidpur', 'Domar', 'Dimla', 'Jaldhaka', 'Kishoreganj']
  },
  'Thakurgaon': {
    division: 'Rangpur',
    lat: 26.0337,
    lon: 88.4617,
    elevationM: 45,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Tangon & Kulik Rivers',
    upazilas: ['Thakurgaon Sadar', 'Pirganj', 'Baliadangi', 'Ranisankhail', 'Haripur']
  },
  'Panchagarh': {
    division: 'Rangpur',
    lat: 26.3411,
    lon: 88.5542,
    elevationM: 55,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Karatoa & Mahananda Rivers',
    upazilas: ['Panchagarh Sadar', 'Tetulia', 'Boda', 'Atwari', 'Debiganj']
  },
  'Lalmonirhat': {
    division: 'Rangpur',
    lat: 25.9923,
    lon: 89.2847,
    elevationM: 35,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Teesta & Dharla Rivers',
    upazilas: ['Lalmonirhat Sadar', 'Patgram', 'Hatibandha', 'Kaliganj', 'Aditmari']
  },

  // --- MYMENSINGH DIVISION (4 Districts) ---
  'Mymensingh': {
    division: 'Mymensingh',
    lat: 24.7471,
    lon: 90.4203,
    elevationM: 19,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Old Brahmaputra River',
    upazilas: [
      'Mymensingh Sadar', 'Kotwali', 'Muktagachha', 'Trishal', 'Bhaluka', 'Fulbaria',
      'Gaffargaon', 'Ishwarganj', 'Nandail', 'Haluaghat', 'Dhobaura', 'Phulpur', 'Tarakanda'
    ]
  },
  'Jamalpur': {
    division: 'Mymensingh',
    lat: 24.9375,
    lon: 89.9378,
    elevationM: 17,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Jamuna & Old Brahmaputra Rivers',
    upazilas: ['Jamalpur Sadar', 'Sarishabari', 'Melandaha', 'Islampur', 'Dewanganj', 'Madarganj', 'Bakshiganj']
  },
  'Netrokona': {
    division: 'Mymensingh',
    lat: 24.8709,
    lon: 90.7279,
    elevationM: 14,
    terrainType: 'haor_wetland',
    canalOrRiver: 'Kangsha & Someshwari Rivers',
    upazilas: ['Netrokona Sadar', 'Kendua', 'Durgapur', 'Mohanganj', 'Purbadhala', 'Barhatta', 'Kalmakanda', 'Madan', 'Khaliajuri', 'Atpara']
  },
  'Sherpur': {
    division: 'Mymensingh',
    lat: 25.0205,
    lon: 90.0153,
    elevationM: 20,
    terrainType: 'alluvial_plain',
    canalOrRiver: 'Old Brahmaputra & Bhogai Rivers',
    upazilas: ['Sherpur Sadar', 'Nalitabari', 'Nakla', 'Jhenaigati', 'Sreebardi']
  }
};

/**
 * Featured deep-profile upazila templates with custom detailed corridors
 */
const FEATURED_UPAZILA_TEMPLATES: Record<string, Partial<UpazilaLocation>> = {
  'Mirpur': {
    lat: 23.8223,
    lon: 90.3654,
    elevationM: 8,
    terrainType: 'urban_delta',
    primaryHazards: ['Urban Waterlogging', 'Heat Island', 'Kallyanpur Canal Surcharge'],
    vulnerabilitySummary: 'Severe drainage backflow during monsoon downpours exceeding 25mm/h. Heat island delta +3.4°C along Rokeya Sarani.',
    canalOrRiver: 'Kallyanpur Khal & Turag River',
    criticalFacilities: {
      hospital: 'Mirpur General Hospital & BIRDEM 2',
      fireStation: 'Mirpur Fire Service & Civil Defence Station',
      shelterOrHub: 'Mirpur Indoor Stadium Emergency Hub',
    },
    sampleCorridors: [
      { name: 'Mirpur-10 Circle to Kazipara', type: 'arterial', baseCongestion: 'SEVERE', floodVulnerability: 'HIGH' },
      { name: 'Begum Rokeya Sarani Corridor', type: 'arterial', baseCongestion: 'CONGESTED', floodVulnerability: 'HIGH' },
      { name: 'Mirpur-14 Cantonment Link', type: 'collector', baseCongestion: 'MODERATE', floodVulnerability: 'LOW' },
    ],
  },
  'Dhanmondi': {
    lat: 23.7461,
    lon: 90.3742,
    elevationM: 7,
    terrainType: 'urban_delta',
    primaryHazards: ['Lake Perimeter Surcharge', 'Flash Drainage Bottlenecks', 'Thermal Asphalt Retention'],
    vulnerabilitySummary: 'Dhanmondi Lake overflow hazard during prolonged torrential rains; high vehicle density at Road 27 & Mirpur Road.',
    canalOrRiver: 'Dhanmondi Lake & Ramna Sluice',
    criticalFacilities: {
      hospital: 'Bangladesh Medical College Hospital',
      fireStation: 'Mohammadpur-Dhanmondi Fire Station',
      shelterOrHub: 'Dhanmondi Lake Amphitheater Transit Post',
    },
    sampleCorridors: [
      { name: 'Mirpur Road (Science Lab to 27)', type: 'arterial', baseCongestion: 'SEVERE', floodVulnerability: 'MEDIUM' },
      { name: 'Satmasjid Road Boulevard', type: 'arterial', baseCongestion: 'CONGESTED', floodVulnerability: 'MEDIUM' },
      { name: 'Dhanmondi 32 Cultural Bypass', type: 'collector', baseCongestion: 'FREE_FLOW', floodVulnerability: 'LOW' },
    ],
  },
  'Gulshan': {
    lat: 23.7925,
    lon: 90.4078,
    elevationM: 10,
    terrainType: 'urban_delta',
    primaryHazards: ['Gulshan Lake Surcharge', 'Midday Radiant Heat', 'Intersection Gridlock'],
    vulnerabilitySummary: 'Lake culvert discharge congestion; high commercial traffic choke points at Gulshan-1 and Gulshan-2 circles.',
    canalOrRiver: 'Gulshan-Banani Lake',
    criticalFacilities: {
      hospital: 'United Hospital Gulshan',
      fireStation: 'Baridhara Fire Station',
      shelterOrHub: 'Gulshan Youth Club Operational Center',
    },
    sampleCorridors: [
      { name: 'Gulshan Avenue (1 to 2)', type: 'arterial', baseCongestion: 'CONGESTED', floodVulnerability: 'LOW' },
      { name: 'Bir Uttam Mir Shawkat Sarak', type: 'arterial', baseCongestion: 'CONGESTED', floodVulnerability: 'MEDIUM' },
      { name: 'Lakehead Promenade Bypass', type: 'collector', baseCongestion: 'FREE_FLOW', floodVulnerability: 'LOW' },
    ],
  },
  'Uttara': {
    lat: 23.8759,
    lon: 90.3795,
    elevationM: 9,
    terrainType: 'urban_delta',
    primaryHazards: ['Airport Expressway Flood Surcharge', 'Airport Flight Corridor Fog', 'Sector 10 Canal Inundation'],
    vulnerabilitySummary: 'Heavy transit corridor connected to Dhaka Airport & Elevated Expressway; localized waterlogging in lower sectors.',
    canalOrRiver: 'Uttara Sector 11 Khal',
    criticalFacilities: {
      hospital: 'Kuwait Bangladesh Friendship Government Hospital',
      fireStation: 'Uttara Fire Service Station',
      shelterOrHub: 'Sector 3 Community Logistics Center',
    },
    sampleCorridors: [
      { name: 'Dhaka-Mymensingh Highway (Uttara)', type: 'expressway', baseCongestion: 'SEVERE', floodVulnerability: 'MEDIUM' },
      { name: 'Jashimuddin Avenue Link', type: 'arterial', baseCongestion: 'MODERATE', floodVulnerability: 'MEDIUM' },
      { name: 'Rabindra Sarani Sector Bypass', type: 'collector', baseCongestion: 'FREE_FLOW', floodVulnerability: 'LOW' },
    ],
  },
  'Mohammadpur': {
    lat: 23.7542,
    lon: 90.3602,
    elevationM: 7,
    terrainType: 'urban_delta',
    primaryHazards: ['Ramchandrapur Khal Surcharge', 'Asphalt Heat Islands', 'Beribadh Runoff Bottlenecks'],
    vulnerabilitySummary: 'High population density corridor; Ramchandrapur canal runoff into Buriganga river prone to backflow.',
    canalOrRiver: 'Ramchandrapur Khal & Buriganga River',
    criticalFacilities: {
      hospital: 'Shaheed Suhrawardy Medical College Hospital',
      fireStation: 'Mohammadpur Fire Station',
      shelterOrHub: 'Town Hall Community Relief Ground',
    },
    sampleCorridors: [
      { name: 'Mirpur Road to Asad Gate', type: 'arterial', baseCongestion: 'SEVERE', floodVulnerability: 'HIGH' },
      { name: 'Taj Mahal Road Feeder', type: 'collector', baseCongestion: 'CONGESTED', floodVulnerability: 'MEDIUM' },
    ],
  },
  'Banani': {
    lat: 23.7937,
    lon: 90.4043,
    elevationM: 9,
    terrainType: 'urban_delta',
    primaryHazards: ['Kemal Ataturk Traffic Surcharge', 'Banani Lake Perimeter Inundation', 'Elevated Heat Delta'],
    vulnerabilitySummary: 'Major corporate spine connecting Airport Road and Gulshan; Kemal Ataturk avenue bottlenecks during rush hours.',
    canalOrRiver: 'Banani Lake',
    criticalFacilities: {
      hospital: 'Kurmitola General Hospital (Adjacent)',
      fireStation: 'Kurmitola Fire Station',
      shelterOrHub: 'Banani Club Disaster Coordination Post',
    },
    sampleCorridors: [
      { name: 'Kemal Ataturk Avenue', type: 'arterial', baseCongestion: 'SEVERE', floodVulnerability: 'LOW' },
      { name: 'Road 11 Commercial Spine', type: 'collector', baseCongestion: 'CONGESTED', floodVulnerability: 'LOW' },
    ],
  },
  'Motijheel': {
    lat: 23.7330,
    lon: 90.4172,
    elevationM: 6,
    terrainType: 'urban_delta',
    primaryHazards: ['Commercial Asphalt Heat Surcharge', 'Old City Culvert Overtopping', 'Underground Vault Submersion'],
    vulnerabilitySummary: 'Central financial district; extensive impervious concrete coverage leads to rapid thermal buildup and surface inundation.',
    canalOrRiver: 'Segunbagicha Khal & Buriganga Outfall',
    criticalFacilities: {
      hospital: 'Dhaka Medical College Hospital (Nearby)',
      fireStation: 'Siddique Bazar Central Fire Station',
      shelterOrHub: 'Bangabandhu National Stadium Emergency Hub',
    },
    sampleCorridors: [
      { name: 'Dilkusha Commercial Spine', type: 'arterial', baseCongestion: 'SEVERE', floodVulnerability: 'HIGH' },
      { name: 'Shapla Chattar Roundabout', type: 'arterial', baseCongestion: 'SEVERE', floodVulnerability: 'MEDIUM' },
    ],
  },
  'Savar': {
    lat: 23.8583,
    lon: 90.2667,
    elevationM: 11,
    terrainType: 'alluvial_plain',
    primaryHazards: ['Dhaleshwari River Runoff', 'Industrial Effluent Waterlogging', 'Highway Freight Gridlock'],
    vulnerabilitySummary: 'Critical national highway junction; Bangabandhu Bridge transit spine prone to freight delays during monsoon storms.',
    canalOrRiver: 'Banshi & Dhaleshwari Rivers',
    criticalFacilities: {
      hospital: 'Enam Medical College & Hospital',
      fireStation: 'Savar Fire Service & Civil Defence',
      shelterOrHub: 'Jahangirnagar Contingency Base',
    },
    sampleCorridors: [
      { name: 'Dhaka-Aricha Highway (Savar Spine)', type: 'arterial', baseCongestion: 'SEVERE', floodVulnerability: 'HIGH' },
      { name: 'EPZ Industrial Feeder Road', type: 'collector', baseCongestion: 'CONGESTED', floodVulnerability: 'MEDIUM' },
    ],
  },
  'Tejgaon': {
    lat: 23.7598,
    lon: 90.3912,
    elevationM: 7,
    terrainType: 'urban_delta',
    primaryHazards: ['Industrial Asphalt Heat Retention', 'Railway Underpass Waterlogging', 'Heavy Truck Congestion'],
    vulnerabilitySummary: 'Severe urban heat island effect reaching 38°C surface temps; Mohakhali flyover approach congestion.',
    canalOrRiver: 'Begunbari Khal & Hatirjheel',
    criticalFacilities: {
      hospital: 'National Institute of Diseases of the Chest and Hospital',
      fireStation: 'Tejgaon Industrial Area Fire Station',
      shelterOrHub: 'Hatirjheel Emergency Amphitheater',
    },
    sampleCorridors: [
      { name: 'Shaheed Tajuddin Ahmed Sarani', type: 'arterial', baseCongestion: 'SEVERE', floodVulnerability: 'HIGH' },
      { name: 'Hatirjheel Circular Express Ring', type: 'expressway', baseCongestion: 'MODERATE', floodVulnerability: 'LOW' },
    ],
  },
};

/**
 * Builds an UpazilaLocation object with complete parameters, sensible coordinates,
 * and terrain characteristics.
 */
function createUpazilaLocation(
  upazilaName: string,
  zillaName: string,
  indexInDistrict: number,
  totalInDistrict: number
): UpazilaLocation {
  const meta = BANGLADESH_ADMIN_DATA[zillaName] || {
    division: 'Dhaka',
    lat: 23.8103,
    lon: 90.4125,
    elevationM: 10,
    terrainType: 'alluvial_plain' as const,
    canalOrRiver: 'Local Canal System',
    upazilas: [upazilaName]
  };

  // If we have a custom curated profile for this specific upazila, merge it
  const custom = FEATURED_UPAZILA_TEMPLATES[upazilaName];
  if (custom) {
    return {
      name: upazilaName,
      nameBn: undefined,
      zilla: zillaName,
      division: meta.division,
      lat: custom.lat ?? meta.lat,
      lon: custom.lon ?? meta.lon,
      elevationM: custom.elevationM ?? meta.elevationM,
      terrainType: custom.terrainType ?? meta.terrainType,
      primaryHazards: custom.primaryHazards ?? [`${upazilaName} Drainage Bottleneck`, 'Urban Heat Stress', 'Transit Congestion'],
      vulnerabilitySummary: custom.vulnerabilitySummary ?? `Active municipal zone in ${zillaName}. Monitored for localized rainfall inundation and road transit safety.`,
      canalOrRiver: custom.canalOrRiver ?? meta.canalOrRiver,
      criticalFacilities: custom.criticalFacilities ?? {
        hospital: `${upazilaName} Upazila Health Complex`,
        fireStation: `${upazilaName} Fire Service & Civil Defence Station`,
        shelterOrHub: `${upazilaName} Community Disaster Coordination Center`,
      },
      sampleCorridors: custom.sampleCorridors ?? [
        { name: `${upazilaName} Central Avenue`, type: 'arterial', baseCongestion: 'CONGESTED', floodVulnerability: 'MEDIUM' },
        { name: `${upazilaName} Feeder Highway`, type: 'collector', baseCongestion: 'MODERATE', floodVulnerability: 'LOW' },
      ],
    };
  }

  // Slightly offset coordinates around the district center so map points don't stack directly on top of each other
  const angle = (indexInDistrict / Math.max(1, totalInDistrict)) * 2 * Math.PI;
  const radiusKm = 2.5 + (indexInDistrict % 5) * 1.8;
  const latOffset = (radiusKm / 111) * Math.cos(angle);
  const lonOffset = (radiusKm / (111 * Math.cos((meta.lat * Math.PI) / 180))) * Math.sin(angle);

  const lat = Math.round((meta.lat + latOffset) * 10000) / 10000;
  const lon = Math.round((meta.lon + lonOffset) * 10000) / 10000;

  return {
    name: upazilaName,
    nameBn: undefined,
    zilla: zillaName,
    division: meta.division,
    lat,
    lon,
    elevationM: meta.elevationM + ((indexInDistrict % 4) - 2),
    terrainType: meta.terrainType,
    primaryHazards: [
      `${upazilaName} Monsoon Waterlogging`,
      `${meta.canalOrRiver.split('&')[0].trim()} High Water Alert`,
      'Corridor Traffic Bottlenecks'
    ],
    vulnerabilitySummary: `Monitored municipal territory in ${zillaName}, ${meta.division} division. Live hydrological catchment draining towards ${meta.canalOrRiver}.`,
    canalOrRiver: meta.canalOrRiver,
    criticalFacilities: {
      hospital: `${upazilaName} Health Complex / District Hospital`,
      fireStation: `${upazilaName} Fire Service Station`,
      shelterOrHub: `${upazilaName} Emergency Management Compound`,
    },
    sampleCorridors: [
      { name: `${upazilaName} Main Arterial Spine`, type: 'arterial', baseCongestion: 'CONGESTED', floodVulnerability: 'MEDIUM' },
      { name: `${upazilaName} Regional Transit Bypass`, type: 'collector', baseCongestion: 'MODERATE', floodVulnerability: 'LOW' },
    ],
  };
}

/**
 * Builds the hierarchical DivisionData array for all 8 Divisions and 64 Zillas.
 */
function buildBangladeshLocations(): DivisionData[] {
  const divisionNames = [
    'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi',
    'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'
  ];

  const divisionBnMap: Record<string, string> = {
    'Dhaka': 'ঢাকা',
    'Chattogram': 'চট্টগ্রাম',
    'Sylhet': 'সিলেট',
    'Rajshahi': 'রাজশাহী',
    'Khulna': 'খুলনা',
    'Barishal': 'বরিশাল',
    'Rangpur': 'রংপুর',
    'Mymensingh': 'ময়মনসিংহ'
  };

  return divisionNames.map((divName) => {
    // Find all districts belonging to this division
    const districtEntries = Object.entries(BANGLADESH_ADMIN_DATA).filter(
      ([, meta]) => meta.division.toLowerCase() === divName.toLowerCase()
    );

    const zillas: ZillaData[] = districtEntries.map(([distName, meta]) => {
      const upazilaLocations = meta.upazilas.map((uName, idx) =>
        createUpazilaLocation(uName, distName, idx, meta.upazilas.length)
      );

      return {
        name: distName,
        nameBn: undefined,
        division: divName,
        lat: meta.lat,
        lon: meta.lon,
        upazilas: upazilaLocations,
      };
    });

    return {
      name: divName,
      nameBn: divisionBnMap[divName] || divName,
      zillas,
    };
  });
}

export const BANGLADESH_LOCATIONS: DivisionData[] = buildBangladeshLocations();

// --- Helper Functions ---

/**
 * Get all 8 official Divisions of Bangladesh
 */
export function getAllDivisions(): string[] {
  return BANGLADESH_LOCATIONS.map((d) => d.name);
}

/**
 * Get all 64 Districts (Zillas) in Bangladesh, or filter by division
 */
export function getAllZillas(): string[] {
  return Object.keys(BANGLADESH_ADMIN_DATA).sort();
}

/**
 * Get all Zillas belonging to a specific division
 */
export function getZillasByDivision(divisionName: string): string[] {
  if (!divisionName) return getAllZillas();
  const div = BANGLADESH_LOCATIONS.find((d) => d.name.toLowerCase() === divisionName.toLowerCase());
  if (div) {
    return div.zillas.map((z) => z.name);
  }
  // Fallback search across admin data
  return Object.entries(BANGLADESH_ADMIN_DATA)
    .filter(([, meta]) => meta.division.toLowerCase() === divisionName.toLowerCase())
    .map(([name]) => name);
}

/**
 * Find the parent division for any given Zilla
 */
export function getDivisionForZilla(zillaName: string): string {
  const clean = (zillaName || '').trim().toLowerCase();
  for (const [distName, meta] of Object.entries(BANGLADESH_ADMIN_DATA)) {
    if (distName.toLowerCase() === clean) {
      return meta.division;
    }
  }
  return 'Dhaka';
}

/**
 * Get ALL Upazilas and Thanas for a specific Zilla.
 * Supports both `getUpazilasByZilla(divisionName, zillaName)` and `getUpazilasByZilla(zillaName)`.
 * Guarantees that EVERY Zilla shows all its upazilas and thanas!
 */
export function getUpazilasByZilla(divisionOrZilla: string, zillaName?: string): UpazilaLocation[] {
  // If two arguments were passed: (division, zilla)
  let targetZilla = (zillaName || divisionOrZilla || '').trim();
  if (zillaName && zillaName.trim().length > 0) {
    targetZilla = zillaName.trim();
  }

  if (!targetZilla) {
    targetZilla = 'Dhaka';
  }

  const cleanZilla = targetZilla.toLowerCase();

  // 1. Search in compiled hierarchical structure
  for (const div of BANGLADESH_LOCATIONS) {
    const matchedZilla = div.zillas.find(
      (z) => z.name.toLowerCase() === cleanZilla || z.name.toLowerCase().includes(cleanZilla)
    );
    if (matchedZilla && matchedZilla.upazilas.length > 0) {
      return matchedZilla.upazilas;
    }
  }

  // 2. Direct search in BANGLADESH_ADMIN_DATA
  for (const [distName, meta] of Object.entries(BANGLADESH_ADMIN_DATA)) {
    if (distName.toLowerCase() === cleanZilla || distName.toLowerCase().includes(cleanZilla)) {
      return meta.upazilas.map((uName, idx) =>
        createUpazilaLocation(uName, distName, idx, meta.upazilas.length)
      );
    }
  }

  // 3. Fallback: if user specified an arbitrary custom name, generate a usable fallback
  return [
    createUpazilaLocation(`${targetZilla} Sadar`, targetZilla, 0, 1),
    createUpazilaLocation(targetZilla, targetZilla, 1, 1),
  ];
}

/**
 * Look up detailed UpazilaLocation by division, zilla, and upazila name.
 * If not found, dynamically constructs one so coordinates & maps never break.
 */
export function getLocationDetails(
  divisionName: string,
  zillaName: string,
  upazilaName: string
): UpazilaLocation | null {
  const upazilas = getUpazilasByZilla(divisionName, zillaName);
  const cleanUpazila = (upazilaName || '').trim().toLowerCase();

  const match = upazilas.find((u) => u.name.toLowerCase() === cleanUpazila);
  if (match) return match;

  // Fallback to first upazila if available
  if (upazilas.length > 0) return upazilas[0];

  // If no upazilas found, construct on the fly
  return createUpazilaLocation(upazilaName || 'Mirpur', zillaName || 'Dhaka', 0, 1);
}

/**
 * Default starting location for NagarShield: Mirpur, Dhaka
 */
export const DEFAULT_BANGLADESH_LOCATION: UpazilaLocation =
  BANGLADESH_LOCATIONS[0]?.zillas[0]?.upazilas[0] ||
  createUpazilaLocation('Mirpur', 'Dhaka', 0, 1);

/**
 * Calculate distance between two GPS coordinates using Haversine formula (km)
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Find the closest Bangladesh Upazila for given GPS coordinates
 */
export function findNearestUpazila(lat: number, lon: number): { upazila: UpazilaLocation; distanceKm: number } {
  let closest: UpazilaLocation = DEFAULT_BANGLADESH_LOCATION;
  let minDistance = Infinity;

  for (const div of BANGLADESH_LOCATIONS) {
    for (const zilla of div.zillas) {
      for (const upazila of zilla.upazilas) {
        const dist = calculateDistanceKm(lat, lon, upazila.lat, upazila.lon);
        if (dist < minDistance) {
          minDistance = dist;
          closest = upazila;
        }
      }
    }
  }

  return { upazila: closest, distanceKm: minDistance };
}
