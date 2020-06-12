import mongoosePaginate from 'mongoose-paginate';

mongoosePaginate.paginate.options = {
	lean: true,
	limit: 20,
};

export default mongoosePaginate;

/*

var options = {
  select: 'title date author',
  sort: { date: -1 },
  populate: 'author',
  lean: true,
  offset: 20, 
  limit: 10
};
*/
