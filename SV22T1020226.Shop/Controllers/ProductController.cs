using Microsoft.AspNetCore.Mvc;
using SV22T1020226.BusinessLayers;
using SV22T1020226.Models.Catalog;
using SV22T1020226.Models.Common;

namespace SV22T1020226.Shop.Controllers
{
    public class ProductController : Controller
    {
        private const int PAGE_SIZE = 12;

        // ============================
        // 🔹 Index: AJAX + session + clear filter
        // ============================
        public async Task<IActionResult> Index(
            string? search,
            int categoryId = 0,
            decimal minPrice = 0,
            decimal maxPrice = 0,
            int page = 1,
            bool clear = false)
        {
            // ============================
            // 🔹 Clear session khi bấm nút
            // ============================
            if (clear)
            {
                HttpContext.Session.Remove("SEARCH");
                HttpContext.Session.Remove("CATEGORY");
                HttpContext.Session.Remove("MIN_PRICE");
                HttpContext.Session.Remove("MAX_PRICE");
                HttpContext.Session.Remove("LAST_SEARCH"); // giữ tương thích menu cũ

                search = "";
                categoryId = 0;
                minPrice = 0;
                maxPrice = 0;
            }
            else
            {
                // ============================
                // 🔹 Lấy từ session nếu param rỗng
                // ============================
                if (string.IsNullOrEmpty(search))
                    search = HttpContext.Session.GetString("SEARCH") ?? HttpContext.Session.GetString("LAST_SEARCH");

                if (categoryId == 0)
                    categoryId = HttpContext.Session.GetInt32("CATEGORY") ?? 0;

                if (minPrice == 0)
                {
                    var min = HttpContext.Session.GetString("MIN_PRICE");
                    if (!string.IsNullOrEmpty(min))
                        decimal.TryParse(min, out minPrice);
                }

                if (maxPrice == 0)
                {
                    var max = HttpContext.Session.GetString("MAX_PRICE");
                    if (!string.IsNullOrEmpty(max))
                        decimal.TryParse(max, out maxPrice);
                }
            }

            // ============================
            // 🔹 Tạo input object
            // ============================
            var input = new ProductSearchInput
            {
                Page = page,
                PageSize = PAGE_SIZE,
                SearchValue = search ?? "",
                CategoryID = categoryId,
                MinPrice = minPrice,
                MaxPrice = maxPrice
            };

            // ============================
            // 🔹 Lưu session (nếu không clear)
            // ============================
            if (!clear)
            {
                HttpContext.Session.SetString("SEARCH", input.SearchValue ?? "");
                HttpContext.Session.SetInt32("CATEGORY", input.CategoryID);
                HttpContext.Session.SetString("MIN_PRICE", input.MinPrice.ToString());
                HttpContext.Session.SetString("MAX_PRICE", input.MaxPrice.ToString());

                // 🔹 giữ tương thích cũ cho menu
                HttpContext.Session.SetString("LAST_SEARCH", input.SearchValue ?? "");
            }

            // ============================
            // 🔹 Lấy dữ liệu sản phẩm
            // ============================
            var data = await CatalogDataService.ListProductsAsync(input);

            // ============================
            // 🔹 Lấy danh mục
            // ============================
            var categories = await CatalogDataService.ListCategoriesAsync(new PaginationSearchInput
            {
                Page = 1,
                PageSize = 200
            });

            ViewBag.SearchInput = input;
            ViewBag.Categories = categories.DataItems;

            // ============================
            // 🔹 Nếu AJAX request, trả về partial
            // ============================
            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                return PartialView("_ProductList", data);
            }

            return View(data);
        }

        // ============================
        // 🔹 Detail giữ nguyên
        // ============================
        public async Task<IActionResult> Detail(int id)
        {
            var product = await CatalogDataService.GetProductAsync(id);
            if (product == null)
                return RedirectToAction("Index");

            ViewBag.Photos = await CatalogDataService.ListPhotosAsync(id);
            ViewBag.Attributes = await CatalogDataService.ListAttributesAsync(id);

            var related = await CatalogDataService.ListProductsAsync(new ProductSearchInput
            {
                Page = 1,
                PageSize = 4,
                CategoryID = product.CategoryID ?? 0
            });

            ViewBag.RelatedProducts = related.DataItems
                .Where(p => p.ProductID != id)
                .Take(4)
                .ToList();

            return View(product);
        }
    }
}