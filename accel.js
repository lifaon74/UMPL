nb_ticks = 10000.0;
steps   = 100.0;

a = (steps * 2.0) / (nb_ticks * nb_ticks);
a = -a;
console.log(a);

//v = a / 2.0;
v = (nb_ticks - 0.5) * -a;

console.log(v);

d = 0.0;
for(i = 0; i < nb_ticks; i++) {
	d += v;
	v += a;
}

console.log(d, v);// v = 0.02