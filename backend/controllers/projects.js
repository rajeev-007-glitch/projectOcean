const Project = require ('../models/project');
const {BadRequestError, NotFoundError} = require ('../errors');
const {StatusCodes} = require ('http-status-codes');

const getAllProject = async (req, res) => {
  const {projectName, sort, numericFilters} = req.query;
  const queryObject = {};
  if (projectName) {
    queryObject.projectName = {$regex: projectName, $options: 'i'};
  }
  if (numericFilters) {
    const operatorMap = {
      '>': '$gt',
      '>=': '$gta',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lta',
    };
    const regex = /\b(<|>|>=|=|<|<=)\b/g;
    var filters = numericFilters.replace (
      regex,
      match => `-${operatorMap[match]}-`
    );

    const options = ['rating'];
    filters = filters.split (',').forEach (item => {
      const [field, operator, value] = item.split ('-');
      if (options.includes (field)) {
        queryObject[field] = {[operator]: Number (value)};
      }
    });
  }
  let result = Project.find (queryObject);
  if (sort === 'latest') {
    result = result.sort ('-createdAt');
  }
  if (sort === 'oldest') {
    result = result.sort ('createdAt');
  }
  if (sort === 'a-z') {
    result = result.sort ('position');
  }
  if (sort === 'z-a') {
    result = result.sort ('-position');
  } else {
    result = result.sort ('createdAt');
  }

  const page = Number (req.query.page) || 1;
  const limit = Number (req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip (skip).limit (limit);

  const projects = await result;

  const totalProjects = await Project.countDocuments (queryObject);
  const numOfPages = Math.ceil (totalProjects / limit);

  res.status (StatusCodes.OK).json ({projects, totalProjects, numOfPages});
};

const createProject = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const project = await Project.create (req.body);
  res.status (StatusCodes.CREATED).json ({project});
};

const getProject = async (req, res) => {
  const {user: {userId}, params: {id: projectId}} = req;
  const project = await Project.findOne ({_id: projectId, createdBy: userId});
  if (!project) {
    throw new NotFoundError (
      `Project with projectId: ${projectId} does not exist...`
    );
  }
  res.status (StatusCodes.OK).json({project});
};

const updateProject = async (req, res) => {
  const {
    body: { projectName, discription, author, technologyUsed, collaborator,deployment, code },
    user: { userId },
    params: { id: projectId },
  } = req
  if(!projectName || !author || !technologyUsed || !code){
    throw new BadRequestError(`ProjectName, Author, TechnologyUsed and code fields can't be empty`)
  }
  const project = await Project.findOneAndUpdate ({_id: projectId, createdBy: userId}, req.body, {
    new: true,
    runValidators: true,
  });
  if (!project) {
    throw new NotFoundError (
      `Project with projectId: ${projectId} does not exist...`
    );
  }
  res.status (StatusCodes.OK).json ({project});
};

const deleteProject = async (req, res) => {
  const {
    user: { userId },
    params: { id: ProjectId },
  } = req

  const project = await Project.findByIdAndDelete ({_id: projectId, createdBy: userId});
  if (!project) {
    throw new NotFoundError (
      `Project with projectId: ${projectId} does not exist...`
    );
  }
  res.status (StatusCodes.OK).json ({
    msg: `Project with projectId: ${projectId} has been successfully deleted...`,
  });
};

const showStats = async (req, res) => {
  let stats = await Project.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Project.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);
  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y');
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

module.exports = {
  getAllProject,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  showStats
};
