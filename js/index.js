$(document).ready(function(){
  /* Navigation Bar transitions - Adds and removes classes from elements on scroll */
	let scrollpos = window.scrollY;
	const banner = document.querySelector("#index-banner");
	const header = document.querySelector("#nav-bar");
	const nav_wrapper = document.querySelector("#nav-wrapper");
	const nav_list = document.querySelector("#nav-list");

  const header_height = banner.offsetHeight;

	function remove_class_on_scroll(){
		header.classList.remove("scroll-down");
		header.classList.add("scroll-up");
		nav_wrapper.classList.remove("nav-wrapper", "container");
		nav_wrapper.classList.add("center");
		nav_list.classList.remove("right");
	}

	function add_class_on_scroll(){
		header.classList.remove("scroll-up");
		header.classList.add("scroll-down");
		nav_wrapper.classList.add("nav-wrapper", "container");
		nav_wrapper.classList.remove("center");
		nav_list.classList.add("right");
	}

	window.addEventListener('scroll', function () {
		scrollpos = window.scrollY;
		if (scrollpos >= ((8/10)*header_height)) {
			add_class_on_scroll();
		} else {
			remove_class_on_scroll();
		}
	});

});