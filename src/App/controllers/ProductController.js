import * as Yup from 'yup';
import Product from '../models/Product';
import Category from '../models/Category';
import User from '../models/User';

class ProductController {
 async store(request, response){
    const schema = Yup.object({
        name: Yup.string().required(),
        price: Yup.number().required(),
        category_id: Yup.number().required(),
        offer: Yup.boolean(),

    });

    try {
        schema.validateSync(request.body, {abortEarly: false});
    } catch (err) {
        return response.status(400).json({error: err.errors});
    }

    const { admin: isAdmin } = await User.findByPk(request.userId);

    if (!isAdmin) {
      return response.status(401).json();
    }

    const { filename: path } = request.file;
    const { name, price, category_id, offer} = request.body;

    const product = await Product.create({
        name,
        price,
        category_id,
        path,
        offer,
    });

    return response.status(201).json(product);
 }


 async update(request, response){
    const schema = Yup.object({
        name: Yup.string(),
        price: Yup.number(),
        category_id: Yup.number(),
        offer: Yup.boolean(),

    });

    try {
        schema.validateSync(request.body, {abortEarly: false});
    } catch (err) {
        return response.status(400).json({error: err.errors});
    }

    const { admin: isAdmin } = await User.findByPk(request.userId);

    if (!isAdmin) {
      return response.status(401).json();
    }

    const {id} = request.params;

    const findProduct = await Product.findByPk(id);

    if (!findProduct) {
        return response
        .status(400)
        .json({error:'Make sure your product ID is correct'});
    }

    let path;
    if (request.file){
     path = request.file.filename;   
    }

    const { name, price, category_id, offer} = request.body;

    await Product.update({
        name,
        price,
        category_id,
        path,
        offer,
    },{
        where:{
            id,
        }

    });

    return response.status(200).json();
 }
  
 async index(request, response){
    const products = await Product.findAll({
        include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name'],
            },
        ],
    });
    return response.json(products);
 }
 async delete(req, res) {
    try {
      const { id } = req.params;

      
      const product = await Product.findByPk(id);

     
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      
      await product.destroy();

      return res.status(200).json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir o produto:', error);
      return res.status(500).json({ error: 'Erro ao excluir o produto' });
    }
  }
}


export default new ProductController();