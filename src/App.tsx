import React, { useState } from 'react';
import Product from './components/Product';
import SelectedItems from './components/SelectedItems';
import TotalPrice from './components/TotalPrice';
import items from './components/ShopItems';
import SearchAppBar from './components/TopBar';
import { AppTheme, theme1, theme2 } from './components/ThemeSwitcher';
import { Grid, CssBaseline } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Checkout from './components/Checkout';

interface ShopItem {
  name: string;
  description: string;
  price: number;
  img: string;
  quantity: number;
  cartQuantity: number;
  discount: boolean
}

// price for items of one kind
export function calTotalPriceForItem(price: number, cartQuantity: number, discount: boolean): number {
  if (discount === true) {
    return (price * cartQuantity) - (price * Math.floor((cartQuantity / 3)));
  }
  return price * cartQuantity;
}

// get total price
const calcTotalSum = (items: ShopItem[]): number => {
  let totalSum = items.reduce((a, b) => a + calTotalPriceForItem(b.price, b.cartQuantity, b.discount), 0)
  return parseFloat(totalSum.toFixed(2))
}

// localstorage
//ERROR - pārlādējot lapu ar precēm localstorage, tās pašas precces pievienojot neskaitās counter
let localItems: ShopItem[] = [];
let localStorageContent = localStorage.getItem('uniqueKEY')
if (localStorageContent) {
  localItems = JSON.parse(localStorageContent)
}

const App: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<ShopItem[]>(localItems)
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(AppTheme.theme1)
  const cartItems = [...selectedItems];

  // Iznest atsevišķā komponentē?
  const ShopItemsOnLeft = (): any => {
    return <Grid item container spacing={2} xs={8} style={{
      textAlign: 'center',
      alignContent: 'flex-start',
      justifyContent: 'center',
    }}>
      {items.map(item => <Grid item xs={4} key={item.name}>
        <Product
          name={item.name}
          description={item.description}
          price={item.price}
          discount={item.discount}
          img={item.img}
          quantity={item.quantity}
          onSelect={() => {
            let isCurrentItem = function (element: ShopItem): boolean {
              return element.name === item.name;
            };
            if (!cartItems.some(isCurrentItem)) {
              cartItems.push(item);
              item.cartQuantity++;
              item.quantity--
            } else {
              item.cartQuantity++;
              item.quantity--
            }
            setSelectedItems(cartItems)
            localStorage.setItem('uniqueKEY', JSON.stringify(cartItems));
          }}
        /></Grid>)}
    </Grid>
  }

  return (
    <Router>
      <MuiThemeProvider theme={currentTheme === AppTheme.theme1 ? theme1 : theme2}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3} autoHideDuration={900} preventDuplicate>
          <div style={{ overflowX: 'hidden' }}>
            <SearchAppBar setTheme={(theme: AppTheme) => setCurrentTheme(theme)} currentTheme={currentTheme} />
            <Grid container spacing={5} style={{
              padding: '60px 30px',
              margin: '60px 0 0 0',
            }}>
              {/* Left Side */}
              <Route path="/" exact component={ShopItemsOnLeft} />
              <Route path="/checkout" component={Checkout} />
              {/* Right Side */}
              <Grid item container xs={4} style={{
                borderRadius: 5,
                position: 'fixed',
                height: '85vh',
                paddingRight: '40px',
                right: 0,
                overflowY: 'auto',
              }} >
                <Grid item container alignContent='flex-start' spacing={2}>
                  {selectedItems.map((item, index) =>
                    <Grid item xs={12} key={item.name}>
                      <SelectedItems
                        img={item.img}
                        name={item.name}
                        quantity={item.quantity}
                        cartQuantity={item.cartQuantity}
                        onRemove={() => {
                          if (item.cartQuantity > 1) {
                            item.cartQuantity--
                            item.quantity++
                          } else if (item.cartQuantity === 1) {
                            selectedItems.splice(index, 1)
                            item.cartQuantity--
                            item.quantity++
                          }
                          setSelectedItems([...selectedItems])
                          localStorage.setItem('uniqueKEY', JSON.stringify(selectedItems));
                        }}
                      // jaunā pogā remove all
                      // selectedItems.splice(index, 1)
                      // setSelectedItems([...selectedItems])
                      /></Grid>)}
                </Grid>
                <Grid item xs={12} style={{ height: 'auto', alignSelf: 'flex-end' }} >
                  <TotalPrice price={calcTotalSum(selectedItems)} />
                </Grid>
              </Grid>
            </Grid>
          </div>
        </SnackbarProvider>
      </MuiThemeProvider >
    </Router>
  )
}

export default App;