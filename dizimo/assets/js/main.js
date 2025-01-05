(function ($, w, _, N, XLOG, XWARN, XERROR) {
	var _modelo = "<div class='input al currency deposito coin'><input name='al' placeholder='{{HINT}}' type='currency' inputmode='numeric' f='pm' class='recebimentos coin' min='0' inner='<i class='go result'>Alimentação</i>' /><i class='go result'>{{HINT}}</i></div>";

	w.isNum = function (c) {
		return (!isNaN(c) && isFinite(c) && (c !== null) && (c !== null) && (typeof c !== undefined) && (typeof c !== "undefined") && (c !== ''));
	};

	var calcular = (e) => {
		var total = 0;
		var r = $('input.recebimentos');
		for (var i = 0; i < r.length; i++) {
			total += parseFloat(w.isNum(r[i].value) ? r[i].value : 0);
		}

		$('div.input.rc > i').innerHTML = total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

		var oferta = $('input[name="of"]').value;
		oferta = parseFloat(w.isNum(oferta) ? oferta : 1) / 100 * total;
		$('div.input.of > i').innerHTML = oferta.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

		var dizimo = total * 0.1;

		var cd = $('input[name="cd"]').value;
		cd = parseFloat(w.isNum(cd) ? cd : 7) / 100 * dizimo;
		$('div.input.cd > i').innerHTML = cd.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
		$('div.input.dz > i').innerHTML = dizimo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
		$('div.input.dc > i').innerHTML = (dizimo + cd).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
		$('div.input.tt > i').innerHTML = (dizimo + cd + oferta).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
	};

	window.onload = () => {
		var inp = $('input');

		for (var i = 0; i < inp.length; i++) {
			inp[i].on('keyup', calcular);
			inp[i].on('focusout', calcular);
			j[i].on("blur", (e) => {
				var realFormat = (c) => {
					c = c.replace(/[^\d,]/g, '');
					c = c.replace(/[,]/g, '.');

					if (c.trim().length == 0) {
						return -1;
					}

					try {
						c = parseFloat(c);
					} catch (e) {
						return -2;
					}

					return (new Intl.NumberFormat('pt-BR', {
						style: 'currency',
						currency: 'BRL',
					})).format(c);
				};

				e.target.value = realFormat(e.target.value);
			});
		}



	};
})(Zepto, window, this, navigator, console.log, console.warn, console.error);