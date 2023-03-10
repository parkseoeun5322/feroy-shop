import { SyntheticEvent } from "react";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";
import { ADD_CART } from "../../graphql/cart";
import { DELETE_PRODUCT, MutableProduct, Product, UPDATE_PRODUCT } from "../../graphql/products";
import { getClient, graphqlFetcher, QueryKeys } from "../../queryClient";
import arrToObj from "../../util/arrToObj";

const AdminItem = (
    {
        id, 
        imageUrl, 
        price, 
        title, 
        description,
        createdAt,
        isEditing, 
        startEdit,
        doneEdit 
    }: Product & {
        isEditing: Boolean
        startEdit: () => void,
        doneEdit: () => void
    }) => {    
        const queryClient = getClient()
        const { mutate: updateProduct } = useMutation(
            ({ title, imageUrl, price, description } : MutableProduct) => 
                graphqlFetcher(UPDATE_PRODUCT, { id, title, imageUrl, price, description }),
            {
                onSuccess: () => {
                    queryClient.invalidateQueries(QueryKeys.PRODUCTS, {
                        exact: false,
                        refetchInactive: true
                    })
                    doneEdit()
                },
            },
        )

        const { mutate: deleteProduct } = useMutation(
            ({ id } : { id: string }) => 
                graphqlFetcher(DELETE_PRODUCT, { id }),
            {
                onSuccess: () => {
                    queryClient.invalidateQueries(QueryKeys.PRODUCTS, {
                        exact: false,
                        refetchInactive: true
                    })
                },
            },
        )        

        const handleSubmit = (e: SyntheticEvent) => {
            e.preventDefault()
            const formData = arrToObj([...new FormData(e.target as HTMLFormElement)])
            formData.price = Number(formData.price)
            updateProduct(formData as MutableProduct)
        }

        const deleteItem = () => {
            deleteProduct({id})
        }

        if(isEditing) return (
            <li className="product-item">
                <form onSubmit={handleSubmit}>
                    <label>?????????: 
                        <input name="title" type="text" required defaultValue={title} />
                    </label>
                    <label>????????? URL: 
                        <input name="imageUrl" type="text" required defaultValue={imageUrl} />
                    </label>
                    <label>????????????: 
                        <input name="price" type="number" required min="1000" defaultValue={price} />
                    </label>
                    <label>??????: 
                        <textarea name="description" defaultValue={description} />
                    </label>
                    <button type="submit">??????</button>
                </form>
            </li>
        )
        
        return (
            <li className="product-item">
                <Link to={`/products/${id}`}>
                    <p className="product-item__title">{title}</p>
                    <img className="product-item__imageUrl" src={imageUrl} />
                    <span className="product-item__price">???{price}</span>
                </Link>
                {! createdAt && <span>????????? ??????</span>}
                <button className="product-item__add-cart" onClick={startEdit}>??????</button>
                <button className="product-item__delete-cart" onClick={deleteItem}>??????</button>
            </li>
        )
    }

export default AdminItem