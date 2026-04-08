document.addEventListener("DOMContentLoaded", function () {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (el) {
        new bootstrap.Tooltip(el);
    });

    var siteHeader = document.getElementById("siteHeader");
    if (siteHeader) {
        var scrollThreshold = 12;
        function syncHeaderScroll() {
            if (window.scrollY > scrollThreshold) {
                siteHeader.classList.add("site-header--scrolled");
            } else {
                siteHeader.classList.remove("site-header--scrolled");
            }
        }
        syncHeaderScroll();
        window.addEventListener("scroll", syncHeaderScroll, { passive: true });
    }

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var reveals = document.querySelectorAll(".reveal, .reveal-up, .reveal-fade");
    if (reveals.length) {
        if (reduceMotion) {
            reveals.forEach(function (el) {
                el.classList.add("is-visible");
            });
        } else if (!("IntersectionObserver" in window)) {
            reveals.forEach(function (el) {
                el.classList.add("is-visible");
            });
        } else {
            var io = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-visible");
                            io.unobserve(entry.target);
                        }
                    });
                },
                { root: null, rootMargin: "0px 0px -48px 0px", threshold: 0.06 }
            );

            reveals.forEach(function (el) {
                io.observe(el);
            });
        }
    }

    var homeSections = document.querySelectorAll(".home-section");
    if (homeSections.length) {
        if (reduceMotion) {
            homeSections.forEach(function (el) {
                el.classList.add("is-inview");
            });
        } else if (!("IntersectionObserver" in window)) {
            homeSections.forEach(function (el) {
                el.classList.add("is-inview");
            });
        } else {
            var secIo = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-inview");
                            secIo.unobserve(entry.target);
                        }
                    });
                },
                { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
            );
            homeSections.forEach(function (el) {
                secIo.observe(el);
            });
        }
    }
});

/* Back to top — hiển thị khi cuộn, scroll mượt (tôn trọng prefers-reduced-motion) */
document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("backToTop");
    if (!btn) return;

    var threshold = 240;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function toggleVisibility() {
        if (window.scrollY > threshold) {
            btn.classList.add("is-visible");
        } else {
            btn.classList.remove("is-visible");
        }
    }

    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });

    btn.addEventListener("click", function () {
        if (reduceMotion) {
            window.scrollTo(0, 0);
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
    });
});
/// Không Reload khi thay đổi số lượng sản phẩm trong giỏ hàng, cập nhật tổng tiền và số lượng trên badge
document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll('.ldm-qty').forEach(box => {

        const input = box.querySelector('.qty-input');
        const plus = box.querySelector('.plus');
        const minus = box.querySelector('.minus');
        const id = box.dataset.id;

        function update(quantity) {

            fetch('/Cart/UpdateQuantityAjax', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `productId=${id}&quantity=${quantity}`
            })
                .then(res => res.json())
                .then(data => {

                    if (quantity <= 0) {
                        const item = document.querySelector(`.ldm-cart-item[data-id='${id}']`);
                        item.classList.add('fade-out');
                        setTimeout(() => item.remove(), 300);
                    }

                    document.querySelectorAll('.cart-total').forEach(el => {
                        el.innerText = data.total.toLocaleString() + ' đ';
                    });

                    const badge = document.querySelector('.beach-badge');
                    if (badge) badge.innerText = data.count;
                });
        }

        plus.onclick = () => {
            input.value++;
            update(input.value);
        };

        minus.onclick = () => {
            input.value--;
            update(input.value);
        };

        input.onchange = () => {
            update(input.value);
        };
    });

    // REMOVE ITEM
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.onclick = function () {
            const id = this.dataset.id;

            fetch('/Cart/UpdateQuantityAjax', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `productId=${id}&quantity=0`
            }).then(() => {
                const item = document.querySelector(`.ldm-cart-item[data-id='${id}']`);
                item.classList.add('fade-out');
                setTimeout(() => item.remove(), 300);
            });
        };
    });

});
