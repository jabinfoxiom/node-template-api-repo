async function fetchData(
  req,
  res,
  YourModel,
  { condition, sort, populate, selectOptions } = {}
) {
  try {
    const pageSize = parseInt(req.query.limit) || 10;
    const pageNumber = parseInt(req.query.page) || 1;

    if (req.query?.query) {
      req.query.query = req?.query?.query.trim();
    }
    const searchQuery = req.query.query || "";

    var query = condition || {};

    if (searchQuery) {
      const searchCriteria = [];

      // Get the fields from your model's schema
      const fields = Object.keys(YourModel.schema.paths);

      // Generate search criteria for each field
      fields.forEach((field) => {
        const fieldType = YourModel.schema.paths[field].instance;

        if (fieldType === "String") {
          searchCriteria.push({
            [field]: { $regex: searchQuery, $options: "i" },
          });
        }
        // Add more conditions for other field types if needed
      });

      query.$or = searchCriteria;
    }

    const options = {
      sort: sort, // Sorting options
      select: selectOptions, // Select options
    };

    if (req.query.page) {
      options.skip = (pageNumber - 1) * pageSize;
      options.limit = pageSize;
    }

    query = {
      $and: [
        query,
        { $or: [{ isDeleted: false }, { isDeleted: { $ne: true } }] },
      ],
    };

    const totalDocs = await YourModel.countDocuments(query); // Retrieve total count

    const docs = await YourModel.find(query, null, options)
      .populate(populate)
      .lean();

    const hasNextPage = totalDocs > pageSize * pageNumber;
    const hasPreviousPage = pageNumber > 1;

    return { docs, totalDocs, hasNextPage, hasPreviousPage };
  } catch (error) {
    throw error;
  }
}

module.exports = fetchData;
