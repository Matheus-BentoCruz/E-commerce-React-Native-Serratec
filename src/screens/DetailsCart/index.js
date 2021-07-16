import React from 'react';
import { View, Text, Image } from 'react-native';
import { styles } from './styles';
import Button from '../../components/Button';
import Header from '../../components/header';
import { findClienteStorage } from '../../repository/storage'
import api from '../../services/api'
import { findCliente } from '../../services/realm';
const DetailsCart = ({ navigation, route }) => {

  const nome = route.params.nome;
  const preco = route.params.preco;
  const descricao = route.params.descricao;
  const imagem = route.params.imagem;
  const idProduto = route.params.idProduto;

  console.log(nome + " - " + preco)

  const pedidoProduto = async () => {
    const cliente = await findClienteStorage();
    const realm = await findCliente();
    const pedido = cliente.idPedido;
    console.log(pedido)
    if (pedido == 0) {
      const novoPedido = {
        idCliente: cliente.id,
        produtosDoPedido: [{
          idProduto: idProduto,
          quantidade: 1
        }]
      }
      api.post('pedido', novoPedido)
        .then(response => {
          const resposta = response.data;
          const numeroPedido = resposta.idPedido
          const idPedidoInt = parseInt(numeroPedido)
          console.log(resposta.idPedido)
          try {
            realm.write(() => {
              realm.create('Cliente', {
                idLocal: 1,
                id: cliente.id,
                tokenAcesso: cliente.tokenAcesso,
                idPedido: idPedidoInt
              }, 'modified')
            })
            console.log('deu bom ao criar o pedido');
            realm.close();
            navigation.navigate('Cart');
          } catch (error) {
            console.log('deu ruim ao criar o pedido')
            console.log(error)

          }
        })
        .catch(error => {
          console.log(error)
        })
    } else {
      if (pedido > 0) {
        let dto = {
          idPedido: pedido,
          idProduto: idProduto,
          quantidade: 1,
        };
        console.log("dto: " + dto)
        api.post('pedido/detalhes/', dto)
          .then(response => {
            
            
          })
          .catch(error => {
            console.log(error)
          })
      }
    }
  }

  return (
    <View style={styles.container}>
      <Header
        text={'Voltar'}
        screen={' Detalhes'}
        voltar={() => navigation.goBack()}
      />
      <View>
        <View style={styles.containerPrincipal}>
          <View style={styles.viewSuperior}>
            <Image source={{ uri: imagem }} style={styles.image} />
            <View style={styles.viewSuperiorComprar}>
              <Text style={styles.textoProduto}>{nome}</Text>
              <Text style={styles.textoPreco}>R$ {preco}</Text>
            </View>
          </View>
          <View style={styles.viewInferior}>
            <View style={styles.containerFooter}>
              <Text style={styles.textoDescricao}>{descricao}</Text>
            </View>
            <View style={styles.containerButtom}>
              <Button
                title="Adicionar ao Carrinho"
                activeOpacity={0.7}
                continuar={() => pedidoProduto()}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
export default DetailsCart;