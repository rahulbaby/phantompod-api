class BaseController {
  jsonResponse(res, data, code = 200) {
    return res.status(200).json(data);
  }
}

export default BaseController;
