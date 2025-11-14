using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Cozinhe_Comigo_API.Models;
using Cozinhe_Comigo_API.Filters;
using Cozinhe_Comigo_API.Data;
using Cozinhe_Comigo_API.DTOs;
using Cozinhe_Comigo_API.DTOS;
using System.Linq;

namespace Cozinhe_Comigo_API.Controllers
{
    [Route("CozinheComigoAPI/[controller]")]
    [ApiController]
    public class RecipeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RecipeController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/recipe
        [HttpPost]
        public async Task<ActionResult<ReturnDto<Recipe>>> Post(
            [FromBody] CreateRecipeDto recipeDto, 
            [FromHeader] string requesterUserToken)
        {
            try {
                var userIdToken = await _context.Tokens
                    .Where(u => u.TokenCode == requesterUserToken)
                    .Select(u => u.UserId)
                    .FirstOrDefaultAsync();

                if (userIdToken == 0) {
                    return BadRequest(new ReturnDto<Recipe>(
                        EInternStatusCode.BAD_REQUEST,
                        "You need to be authenticated to create a new recipe.",
                        null
                    ));
                }

                if (recipeDto.UserID != userIdToken) { 
                    return BadRequest(new ReturnDto<Recipe>(
                        EInternStatusCode.BAD_REQUEST,
                        "You need to be authenticated with the same user for whom you are trying to create a new recipe.",
                        null
                    ));
                }

                var recipe = new Recipe
                {
                    UserID = recipeDto.UserID,
                    Title = recipeDto.Title,
                    Ingredients = recipeDto.Ingredients,
                    Instructions = recipeDto.Instructions,
                    ImageUrl = recipeDto.ImageUrl,
                    VideoUrl = recipeDto.VideoUrl,
                    CreatedAt = DateTime.UtcNow,
                    AvaliationsCount = 0,
                    IsPublic = recipeDto.IsPublic,
                    AverageRating = 0,
                    Categories = recipeDto.Categories,
                    Portions = recipeDto.Portions,
                    PreparationTime = recipeDto.PreparationTime
                };

                _context.Recipes.Add(recipe);
                int result = await _context.SaveChangesAsync();

                if (result == 0) {
                    return StatusCode(500, new {
                        StatusCode = EInternStatusCode.DB_ERROR,
                        ReturnMessage = "Failed to save recipe. No rows affected."
                    });
                }

                return Ok(new ReturnDto<Recipe>(
                    EInternStatusCode.OK,
                    "Successfully created",
                    recipe
                ));
            } catch (Exception ex) {
                Console.WriteLine("Internal Error");
                Console.WriteLine(ex.Message);

                return StatusCode(500, new {
                    StatusCode = EInternStatusCode.INTERNAL_ERROR,
                    ReturnMessage = "Internal server error while saving recipe.",
                });
            }
        }

        // GET: api/recipe
        [HttpGet]
        public async Task<ActionResult> Get(
            [FromQuery] RecipeFilter filter, 
            [FromHeader] string? requesterUserToken = null
        ) {
            if(filter.PageSize <= 0) {
                return BadRequest(new ReturnDto<List<Recipe>>(
                    EInternStatusCode.BAD_REQUEST,
                    "Invalid page size.",
                    null
                ));
            }

            if (filter.PageNumber <= 0) {
                return BadRequest(new ReturnDto<List<Recipe>>(
                    EInternStatusCode.BAD_REQUEST,
                    "Invalid page number.",
                    null
                ));
            }

            if (filter.PageSize > 200) {
                return BadRequest(new ReturnDto<List<Recipe>>(
                    EInternStatusCode.BAD_REQUEST,
                    "Page size too large. Maximum is 100.",
                    null
                ));
            }

            var query = _context.Recipes.AsNoTracking().AsQueryable();

            //if (filter.IsPublic.HasValue && !filter.IsPublic.Value) {
            //    if (string.IsNullOrEmpty(requesterUserToken)) {
            //        return BadRequest(new ReturnDto<List<Recipe>>(
            //            EInternStatusCode.BAD_REQUEST,
            //            "To view a private recipe, you must authenticate yourself as the recipe's creator.",
            //            null
            //        ));
            //    }

            //var token = await _context.Tokens
            //    .FirstOrDefaultAsync(t => t.TokenCode == requesterUserToken);

            //if (token == null || token.ExpiredAt < DateTime.UtcNow) {
            //    return BadRequest(new ReturnDto<List<Recipe>>(
            //        EInternStatusCode.BAD_REQUEST,
            //        "Invalid or expired authentication token.",
            //        null
            //    ));
            //}

            //if (!filter.UserId.HasValue || token.UserId != filter.UserId.Value) {
            //    return BadRequest(new ReturnDto<List<Recipe>>(
            //        EInternStatusCode.BAD_REQUEST,
            //        "To view a private recipe, the UserId in filter must match the authenticated user.",
            //        null
            //    ));
            //}

            //    query = query.Where(r => r.UserID == token.UserId && !r.IsPublic);
            //} else if ((filter.IsPublic.HasValue && filter.IsPublic.Value)) {
            //    query = query.Where(r => r.IsPublic);
            //}
            Token? token = null;

            // Se o token foi informado, tenta buscar e validar
            if (!string.IsNullOrEmpty(requesterUserToken)) {
                token = await _context.Tokens
                    .FirstOrDefaultAsync(t => t.TokenCode == requesterUserToken);

                if (token == null || token.ExpiredAt < DateTime.UtcNow) {
                    return BadRequest(new ReturnDto<List<Recipe>>(
                        EInternStatusCode.BAD_REQUEST,
                        "Invalid or expired authentication token.",
                        null
                    ));
                }

                // Se o usuário explicitamente solicitou receitas privadas (IsPublic == false),
                // então o UserId no filtro precisa corresponder ao usuário autenticado.
                if (filter.IsPublic.HasValue && filter.IsPublic.Value == false) {
                    if (!filter.UserId.HasValue || token.UserId != filter.UserId.Value) {
                        return BadRequest(new ReturnDto<List<Recipe>>(
                            EInternStatusCode.BAD_REQUEST,
                            "To view a private recipe, the UserId in filter must match the authenticated user.",
                            null
                        ));
                    }
                }
            }

            if (token == null) {
                // Usuário não autenticado → só pode ver públicas
                query = query.Where(r => r.IsPublic);
            } else {
                // Usuário autenticado → pode ver públicas e as próprias privadas
                query = query.Where(r => r.IsPublic || r.UserID == token.UserId);
            }

            if (!string.IsNullOrEmpty(filter.TitleSearch))
                query = query.Where(r => EF.Functions.ILike(r.Title, $"%{filter.TitleSearch}%"));

            if (filter.MinPreparationTime.HasValue)
                query = query.Where(r => r.PreparationTime >= filter.MinPreparationTime);
            if (filter.MaxPreparationTime.HasValue)
                query = query.Where(r => r.PreparationTime <= filter.MaxPreparationTime);

            if (filter.MinRating.HasValue)
                query = query.Where(r => r.AverageRating >= filter.MinRating);
            if (filter.MaxRating.HasValue)
                query = query.Where(r => r.AverageRating <= filter.MaxRating);

            if (filter.MinPortions.HasValue)
                query = query.Where(r => r.Portions >= filter.MinPortions);
            if (filter.MaxPortions.HasValue)
                query = query.Where(r => r.Portions <= filter.MaxPortions);

            if (filter.UserId.HasValue)
                query = query.Where(r => r.UserID == filter.UserId);

            if (filter.Categories != null && filter.Categories.Count > 0) {
                query = query.Where(r =>
                    r.Categories.Any(c =>
                        filter.Categories.Contains(c))
                );
            }

            if (filter.SortBy.HasValue) {
                query = filter.SortBy switch {
                    SortByEnum.Title => filter.SortDescending ? query.OrderByDescending(r => r.Title) : query.OrderBy(r => r.Title),
                    SortByEnum.PreparationTime => filter.SortDescending ? query.OrderByDescending(r => r.PreparationTime) : query.OrderBy(r => r.PreparationTime),
                    SortByEnum.Portions => filter.SortDescending ? query.OrderByDescending(r => r.Portions) : query.OrderBy(r => r.Portions),
                    SortByEnum.CreatedAt => filter.SortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt),
                    SortByEnum.AvaliationsCount => filter.SortDescending ? query.OrderByDescending(r => r.AvaliationsCount) : query.OrderBy(r => r.AvaliationsCount),
                    SortByEnum.AverageRating => filter.SortDescending ? query.OrderByDescending(r => r.AverageRating) : query.OrderBy(r => r.AverageRating),
                    _ => query
                };
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)filter.PageSize);

            query = query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize);

            if (filter.FullResult) {
                var recipes = await query.ToListAsync();

                return Ok(new ReturnDto<List<Recipe>>(
                    EInternStatusCode.OK,
                    "Query executed successfully",
                    recipes
                ) {
                    TotalItems = totalItems,
                    PageNumber = filter.PageNumber,
                    PageSize = filter.PageSize,
                    TotalPages = totalPages
                });
            } else {
                var recipes = await query
                .Select(r => new ReadRecipeDto {
                    Id = r.Id,
                    Title = r.Title,
                    AverageRating = r.AverageRating,
                    PreparationTime = r.PreparationTime,
                    Categories = r.Categories,
                    ImageUrl = r.ImageUrl
                })
                .ToListAsync();

                return Ok(new ReturnDto<List<ReadRecipeDto>>(
                    EInternStatusCode.OK,
                    "Query executed successfully",
                    recipes
                ) {
                    TotalItems = totalItems,
                    PageNumber = filter.PageNumber,
                    PageSize = filter.PageSize,
                    TotalPages = totalPages
                });
            }
        }

        // GET: api/recipe/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(
            int id,
            [FromHeader] string? requesterUserToken = null
        ) {
            try {
                var recipe = await _context.Recipes
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (recipe == null) {
                    return NotFound(new ReturnDto<Recipe>(
                        EInternStatusCode.BAD_REQUEST,
                        $"Recipe with ID {id} not found.",
                        null
                    ));
                }

                // Verificar permissão de visualização
                if (!recipe.IsPublic) {
                    if (string.IsNullOrEmpty(requesterUserToken)) {
                        return BadRequest(new ReturnDto<Recipe>(
                            EInternStatusCode.BAD_REQUEST,
                            "You must be authenticated to view a private recipe.",
                            null
                        ));
                    }

                    var token = await _context.Tokens
                        .FirstOrDefaultAsync(t => t.TokenCode == requesterUserToken);

                    if (token == null || token.ExpiredAt < DateTime.UtcNow) {
                        return BadRequest(new ReturnDto<Recipe>(
                            EInternStatusCode.BAD_REQUEST,
                            "Invalid or expired authentication token.",
                            null
                        ));
                    }

                    if (token.UserId != recipe.UserID) {
                        return BadRequest(new ReturnDto<Recipe>(
                            EInternStatusCode.BAD_REQUEST,
                            "You don't have permission to view this private recipe.",
                            null
                        ));
                    }
                }

                // Buscar informações do autor
                var author = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.id == recipe.UserID);

                if (author == null) {
                    return StatusCode(500, new ReturnDto<Recipe>(
                        EInternStatusCode.INTERNAL_ERROR,
                        "Author information not found.",
                        null
                    ));
                }

                // Montar resposta com informações do autor
                var response = new {
                    id = recipe.Id,
                    userID = recipe.UserID,
                    title = recipe.Title,
                    ingredients = recipe.Ingredients,
                    instructions = recipe.Instructions,
                    imageUrl = recipe.ImageUrl,
                    videoUrl = recipe.VideoUrl,
                    createdAt = recipe.CreatedAt,
                    avaliationsCount = recipe.AvaliationsCount,
                    isPublic = recipe.IsPublic,
                    averageRating = recipe.AverageRating,
                    categories = recipe.Categories,
                    portions = recipe.Portions,
                    preparationTime = recipe.PreparationTime,
                    author = new {
                        id = author.id,
                        name = author.Name,
                        profirePictureUrl = author.ProfirePictureUrl,
                        biography = author.Biography
                    }
                };

                return Ok(new ReturnDto<object>(
                    EInternStatusCode.OK,
                    "Recipe retrieved successfully",
                    response
                ));
            } catch (Exception ex) {
                Console.WriteLine("Internal Error");
                Console.WriteLine(ex.Message);

                return StatusCode(500, new ReturnDto<Recipe>(
                    EInternStatusCode.INTERNAL_ERROR,
                    "Internal server error while retrieving recipe.",
                    null
                ));
            }
        }
    }
}
