import boy1 from '@/assets/avatars/boy-1.jpg';
import boy2 from '@/assets/avatars/boy-2.jpg';
import girl1 from '@/assets/avatars/girl-1.jpg';
import girl2 from '@/assets/avatars/girl-2.jpg';

const BOYS = [boy1, boy2];
const GIRLS = [girl1, girl2];

const FEMALE_NAMES = ['priya','pooja','puja','neha','sneha','anjali','kavita','sunita','rekha','shreya','riya','ritu','nisha','sonia','sonam','komal','payal','pinky','aarti','arti','asha','geeta','sita','radha','laxmi','lakshmi','meena','rani','nazia','ayesha','fatima','sana','zara','sadia','shabnam','farhana','ruksana','tabassum','simran','jyoti','swati','divya','deepika','shalini','madhu','preeti','priti','anita','babita','usha','manisha','archana','bhavna','kiran','muskan','saba','heena','hina','naznin','nasrin','afreen','shabana'];
const MALE_NAMES = ['rahul','amit','vijay','ajay','ravi','sunil','anil','manoj','sanjay','rajesh','mukesh','suresh','ramesh','deepak','vikash','vikas','ankit','rohit','mohit','sachin','arjun','aman','karan','gaurav','abhishek','shivam','saurabh','nitesh','nitin','pankaj','prakash','santosh','md','mohammad','mohd','muhammad','wasid','imran','salman','shahrukh','arbaz','faizan','danish','shoaib','sameer','asif','arif','rizwan','irfan','javed','akash','vivek','rakesh','dinesh','naresh','kumar','raja','raju','golu','sonu','monu'];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function guessGender(name?: string | null): 'male' | 'female' {
  const first = (name || '').trim().toLowerCase().split(/\s+/)[0]?.replace(/[^a-z]/g, '') || '';
  if (!first) return 'male';
  if (FEMALE_NAMES.includes(first)) return 'female';
  if (MALE_NAMES.includes(first)) return 'male';
  // Common Indian pattern: female names usually end with a/i/ya/ika
  if (/(a|i|ya|ika|ita|ina|een|ana)$/.test(first)) return 'female';
  return 'male';
}

/** Deterministic cartoon clipart fallback for users without a profile photo. */
export function getDefaultAvatar(name?: string | null): string {
  const key = (name || 'user').trim().toLowerCase();
  const pool = guessGender(key) === 'female' ? GIRLS : BOYS;
  return pool[hash(key) % pool.length];
}