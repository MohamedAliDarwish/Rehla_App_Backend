const validate = (schema) => {
  return (req, res, next) => {
    console.log("Middleware");
    console.log("req.body =>", req.body);

    const result = schema.safeParse(req.body);

    if (!result.success) {
      console.log("Validation Errors:", result.error.issues);

      return res.status(400).json({
        success: false,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.body = result.data;

    next();
  };
};

module.exports = validate;

// const validate = (schema) => {
//   return (req, res, next) => {
//     console.log("Middleware");
//     console.log("req.body => ", req.body);

//     const result = schema.safeParse(req.body);
//     console.log("=============================");
//     console.log(result);
//     console.log("=============================");
//     console.log(result.success);
//     console.log(result.error.issues);

//     console.log("=============================");

//     if (!result.success) {
//       return res.status(400).json({
//         success: false,
//         errors: result.error.issues.map((issue) => ({
//           field: issue.path.join("."),
//           message: issue.message,
//         })),
//       });
//     }

//     req.body = result.data;

//     next();
//   };
// };

// module.exports = validate;
