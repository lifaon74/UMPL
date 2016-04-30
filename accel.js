nb_ticks = 10000.0;
steps   = 1000.0;

a = (steps * 2.0) / (nb_ticks * nb_ticks);
console.log(a);
v = a / 2;
console.log(v);

// v = a * (nb_ticks - 0.5);
// a = -a;

d = 0.0;
for(i = 0; i < nb_ticks; i++) {
	d += v;
	v += a;
}

console.log(d, v);// v = 0.02