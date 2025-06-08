/**
 * VanillaToast - Pure JavaScript Toast Notification Library
 * Replacement for jQuery Toast with full backward compatibility
 *
 * Author: Generated for oph4py project
 * Date: 2025
 */

class VanillaToast {
	constructor(options = {}) {
		this.options = {
			text: "",
			heading: "",
			showHideTransition: "fade",
			allowToastClose: true,
			hideAfter: 3000,
			loader: true,
			loaderBg: "#9EC600",
			stack: 5,
			position: "bottom-left",
			bgColor: false,
			textColor: false,
			textAlign: "left",
			icon: false,
			beforeShow: function () {},
			afterShown: function () {},
			beforeHide: function () {},
			afterHidden: function () {},
			onClick: function () {},
			...options,
		};

		this._positionClasses = [
			"bottom-left",
			"bottom-right",
			"top-right",
			"top-left",
			"bottom-center",
			"top-center",
			"mid-center",
		];

		this._defaultIcons = ["success", "error", "info", "warning"];

		this.init();
	}

	init() {
		this.prepareOptions();
		this.process();
	}

	prepareOptions() {
		// Handle string or array input
		if (typeof this.options === "string" || Array.isArray(this.options)) {
			this.options = { text: this.options };
		}
	}

	process() {
		this.setup();
		this.addToDom();
		this.position();
		this.bindToast();
		this.animate();
	}

	setup() {
		// Create toast element
		this._toastEl = document.createElement("div");
		this._toastEl.className = "jq-toast-single";

		let html = "";

		// Add loader
		html += '<span class="jq-toast-loader"></span>';

		// Add close button if allowed
		if (this.options.allowToastClose) {
			html += '<span class="close-jq-toast-single">&times;</span>';
		}

		// Handle array text
		if (Array.isArray(this.options.text)) {
			if (this.options.heading) {
				html += `<h2 class="jq-toast-heading">${this.options.heading}</h2>`;
			}
			html += '<ul class="jq-toast-ul">';
			this.options.text.forEach((item, index) => {
				html += `<li class="jq-toast-li" id="jq-toast-item-${index}">${item}</li>`;
			});
			html += "</ul>";
		} else {
			if (this.options.heading) {
				html += `<h2 class="jq-toast-heading">${this.options.heading}</h2>`;
			}
			html += this.options.text;
		}

		this._toastEl.innerHTML = html;

		// Apply styling
		if (this.options.bgColor !== false) {
			this._toastEl.style.backgroundColor = this.options.bgColor;
		}

		if (this.options.textColor !== false) {
			this._toastEl.style.color = this.options.textColor;
		}

		if (this.options.textAlign) {
			this._toastEl.style.textAlign = this.options.textAlign;
		}

		// Add icon classes
		if (this.options.icon !== false) {
			this._toastEl.classList.add("jq-has-icon");
			if (this._defaultIcons.includes(this.options.icon)) {
				this._toastEl.classList.add(`jq-icon-${this.options.icon}`);
			}
		}

		// Add custom class
		if (this.options.class !== false) {
			this._toastEl.classList.add(this.options.class);
		}
	}

	position() {
		if (
			typeof this.options.position === "string" &&
			this._positionClasses.includes(this.options.position)
		) {
			if (this.options.position === "bottom-center") {
				const left = window.innerWidth / 2 - this._container.offsetWidth / 2;
				this._container.style.left = left + "px";
				this._container.style.bottom = "20px";
			} else if (this.options.position === "top-center") {
				const left = window.innerWidth / 2 - this._container.offsetWidth / 2;
				this._container.style.left = left + "px";
				this._container.style.top = "20px";
			} else if (this.options.position === "mid-center") {
				const left = window.innerWidth / 2 - this._container.offsetWidth / 2;
				const top = window.innerHeight / 2 - this._container.offsetHeight / 2;
				this._container.style.left = left + "px";
				this._container.style.top = top + "px";
			} else {
				this._container.classList.add(this.options.position);
			}
		} else if (typeof this.options.position === "object") {
			const pos = this.options.position;
			this._container.style.top = pos.top || "auto";
			this._container.style.bottom = pos.bottom || "auto";
			this._container.style.left = pos.left || "auto";
			this._container.style.right = pos.right || "auto";
		} else {
			this._container.classList.add("bottom-left");
		}
	}

	bindToast() {
		// Trigger afterShown event after setup
		setTimeout(() => {
			this.triggerEvent("afterShown");
			this.processLoader();
		}, 10);

		// Close button handler
		const closeBtn = this._toastEl.querySelector(".close-jq-toast-single");
		if (closeBtn) {
			closeBtn.addEventListener("click", (e) => {
				e.preventDefault();
				this.hide();
			});
		}

		// Click handler
		this._toastEl.addEventListener("click", () => {
			if (typeof this.options.onClick === "function") {
				this.options.onClick(this._toastEl);
			}
		});
	}

	addToDom() {
		// Find or create container
		let container = document.querySelector(".jq-toast-wrap");

		if (!container) {
			container = document.createElement("div");
			container.className = "jq-toast-wrap";
			container.setAttribute("role", "alert");
			container.setAttribute("aria-live", "polite");
			document.body.appendChild(container);
		} else if (this.options.stack && !isNaN(parseInt(this.options.stack, 10))) {
			// Keep existing toasts if stacking
		} else {
			container.innerHTML = "";
		}

		// Remove hidden toasts
		const hiddenToasts = container.querySelectorAll(
			'.jq-toast-single:not([style*="display: block"])'
		);
		hiddenToasts.forEach((toast) => {
			if (toast.style.display === "none" || toast.style.opacity === "0") {
				toast.remove();
			}
		});

		// Add new toast
		container.appendChild(this._toastEl);

		// Handle stacking limit
		if (this.options.stack && !isNaN(parseInt(this.options.stack, 10))) {
			const toasts = container.querySelectorAll(".jq-toast-single");
			const excess = toasts.length - this.options.stack;
			if (excess > 0) {
				for (let i = 0; i < excess; i++) {
					toasts[i].remove();
				}
			}
		}

		this._container = container;
	}

	canAutoHide() {
		return (
			this.options.hideAfter !== false &&
			!isNaN(parseInt(this.options.hideAfter, 10))
		);
	}

	processLoader() {
		if (!this.canAutoHide() || this.options.loader === false) {
			return false;
		}

		const loader = this._toastEl.querySelector(".jq-toast-loader");
		if (!loader) return false;

		const duration = (this.options.hideAfter - 400) / 1000;
		const loaderBg = this.options.loaderBg;

		loader.style.transition = `width ${duration}s ease-in`;
		loader.style.backgroundColor = loaderBg;

		setTimeout(() => {
			loader.classList.add("jq-toast-loaded");
		}, 50);
	}

	animate() {
		// Initially hide
		this._toastEl.style.display = "none";
		this._toastEl.style.opacity = "0";

		this.triggerEvent("beforeShow");

		// Show animation
		if (this.options.showHideTransition.toLowerCase() === "fade") {
			this.fadeIn();
		} else if (this.options.showHideTransition.toLowerCase() === "slide") {
			this.slideDown();
		} else {
			this.show();
		}

		// Auto hide
		if (this.canAutoHide()) {
			setTimeout(() => {
				this.hide();
			}, this.options.hideAfter);
		}
	}

	fadeIn() {
		this._toastEl.style.display = "block";
		this._toastEl.style.transition = "opacity 0.3s ease-in";

		setTimeout(() => {
			this._toastEl.style.opacity = "1";
		}, 10);

		setTimeout(() => {
			this.triggerEvent("afterShown");
		}, 300);
	}

	slideDown() {
		this._toastEl.style.display = "block";
		this._toastEl.style.transform = "translateY(-100%)";
		this._toastEl.style.transition =
			"transform 0.3s ease-out, opacity 0.3s ease-in";
		this._toastEl.style.opacity = "1";

		setTimeout(() => {
			this._toastEl.style.transform = "translateY(0)";
		}, 10);

		setTimeout(() => {
			this.triggerEvent("afterShown");
		}, 300);
	}

	show() {
		this._toastEl.style.display = "block";
		this._toastEl.style.opacity = "1";
		setTimeout(() => {
			this.triggerEvent("afterShown");
		}, 10);
	}

	hide() {
		this.triggerEvent("beforeHide");

		if (this.options.showHideTransition.toLowerCase() === "fade") {
			this.fadeOut();
		} else if (this.options.showHideTransition.toLowerCase() === "slide") {
			this.slideUp();
		} else {
			this.hideInstant();
		}
	}

	fadeOut() {
		this._toastEl.style.transition = "opacity 0.3s ease-out";
		this._toastEl.style.opacity = "0";

		setTimeout(() => {
			this._toastEl.style.display = "none";
			this.triggerEvent("afterHidden");
		}, 300);
	}

	slideUp() {
		this._toastEl.style.transition =
			"transform 0.3s ease-in, opacity 0.3s ease-out";
		this._toastEl.style.transform = "translateY(-100%)";
		this._toastEl.style.opacity = "0";

		setTimeout(() => {
			this._toastEl.style.display = "none";
			this.triggerEvent("afterHidden");
		}, 300);
	}

	hideInstant() {
		this._toastEl.style.display = "none";
		this.triggerEvent("afterHidden");
	}

	triggerEvent(eventName) {
		if (typeof this.options[eventName] === "function") {
			this.options[eventName](this._toastEl);
		}
	}

	reset(type) {
		if (type === "all") {
			const containers = document.querySelectorAll(".jq-toast-wrap");
			containers.forEach((container) => container.remove());
		} else {
			if (this._toastEl) {
				this._toastEl.remove();
			}
		}
	}

	update(options) {
		this.options = { ...this.options, ...options };
		this.setup();
		this.bindToast();
	}

	close() {
		const closeBtn = this._toastEl.querySelector(".close-jq-toast-single");
		if (closeBtn) {
			closeBtn.click();
		}
	}
}

// jQuery-compatible API
window.$ = window.$ || {};
window.$.toast = function (options) {
	const toast = new VanillaToast(options);

	return {
		reset: function (type) {
			toast.reset(type);
		},
		update: function (newOptions) {
			toast.update(newOptions);
		},
		close: function () {
			toast.close();
		},
	};
};

// Default options
window.$.toast.options = {
	text: "",
	heading: "",
	showHideTransition: "fade",
	allowToastClose: true,
	hideAfter: 3000,
	loader: true,
	loaderBg: "#9EC600",
	stack: 5,
	position: "bottom-left",
	bgColor: false,
	textColor: false,
	textAlign: "left",
	icon: false,
	beforeShow: function () {},
	afterShown: function () {},
	beforeHide: function () {},
	afterHidden: function () {},
	onClick: function () {},
};
