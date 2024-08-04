'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, IconButton, MenuItem, Select, InputLabel, FormControl } from '@mui/material'
import { Add, Remove, Edit, Delete } from '@mui/icons-material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#121212',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 3,
  color: 'white',
}

interface InventoryItem {
  name: string;
  quantity: number;
  category: string;
  description: string;
  price: number;
  supplier: string;
}

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)
  const [itemCategory, setItemCategory] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [itemPrice, setItemPrice] = useState(0)
  const [itemSupplier, setItemSupplier] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [editItemName, setEditItemName] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList: InventoryItem[] = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() } as InventoryItem)
    })
    setInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (name: string, quantity: number, category: string, description: string, price: number, supplier: string) => {
    const docRef = doc(collection(firestore, 'inventory'), name)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data() as { quantity: number }
      await setDoc(docRef, { quantity: existingQuantity + quantity, category, description, price, supplier })
    } else {
      await setDoc(docRef, { quantity, category, description, price, supplier })
    }
    await updateInventory()
  }

  const removeItem = async (name: string) => {
    const docRef = doc(collection(firestore, 'inventory'), name)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data() as { quantity: number }
      if (quantity <= 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const deleteItem = async (name: string) => {
    const docRef = doc(collection(firestore, 'inventory'), name)
    await deleteDoc(docRef)
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setItemName('')
    setItemQuantity(1)
    setItemCategory('')
    setItemDescription('')
    setItemPrice(0)
    setItemSupplier('')
  }

  const handleEditOpen = (item: InventoryItem) => {
    setEditItemName(item.name)
    setItemQuantity(item.quantity)
    setItemCategory(item.category)
    setItemDescription(item.description)
    setItemPrice(item.price)
    setItemSupplier(item.supplier)
    setEditOpen(true)
  }
  const handleEditClose = () => setEditOpen(false)

  const handleEditItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), editItemName)
    await setDoc(docRef, { quantity: itemQuantity, category: itemCategory, description: itemDescription, price: itemPrice, supplier: itemSupplier })
    await updateInventory()
    setEditOpen(false)
  }

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filterCategory ? item.category === filterCategory : true)
  )

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding={4}
      bgcolor="#121212"
      color="#fff"
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" color="white">
            Add Item
          </Typography>
          <Stack width="100%" direction="column" spacing={2}>
            <TextField
              id="item-name"
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
            />
            <TextField
              id="item-quantity"
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value))}
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel style={{ color: 'white' }}>Category</InputLabel>
              <Select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                label="Category"
                style={{ color: 'white', borderColor: 'white' }}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value="Food">Food</MenuItem>
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Clothing">Clothing</MenuItem>
              </Select>
            </FormControl>
            <TextField
              id="item-description"
              label="Description"
              variant="outlined"
              fullWidth
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
            />
            <TextField
              id="item-price"
              label="Price"
              variant="outlined"
              type="number"
              fullWidth
              value={itemPrice}
              onChange={(e) => setItemPrice(parseFloat(e.target.value))}
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
            />
            <TextField
              id="item-supplier"
              label="Supplier"
              variant="outlined"
              fullWidth
              value={itemSupplier}
              onChange={(e) => setItemSupplier(e.target.value)}
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, itemQuantity, itemCategory, itemDescription, itemPrice, itemSupplier)
                handleClose()
              }}
              style={{ color: 'white', borderColor: 'white' }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={editOpen}
        onClose={handleEditClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" color="white">
            Edit Item
          </Typography>
          <Stack width="100%" spacing={2}>
            <TextField
              id="edit-item-name"
              label="Item Name"
              variant="outlined"
              fullWidth
              value={editItemName}
              disabled
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
            />
            <TextField
              id="edit-item-quantity"
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value))}
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel style={{ color: 'white' }}>Category</InputLabel>
              <Select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                label="Category"
                style={{ color: 'white', borderColor: 'white' }}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value="Food">Food</MenuItem>
                <MenuItem value="Electronics">Electronics</MenuItem>
                <MenuItem value="Clothing">Clothing</MenuItem>
              </Select>
            </FormControl>
            <TextField
              id="edit-item-description"
              label="Description"
              variant="outlined"
              fullWidth
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
            />
            <TextField
              id="edit-item-price"
              label="Price"
              variant="outlined"
              type="number"
              fullWidth
              value={itemPrice}
              onChange={(e) => setItemPrice(parseFloat(e.target.value))}
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
            />
            <TextField
              id="edit-item-supplier"
              label="Supplier"
              variant="outlined"
              fullWidth
              value={itemSupplier}
              onChange={(e) => setItemSupplier(e.target.value)}
              InputProps={{ style: { color: 'white' } }}
              InputLabelProps={{ style: { color: 'white' } }}
            />
            <Button
              variant="outlined"
              onClick={handleEditItem}
              style={{ color: 'white', borderColor: 'white' }}
            >
              Save
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box display="flex" gap={4} width="100%" maxWidth="1200px">
        <Box width="300px" display="flex" flexDirection="column" gap={2}>
          <Button variant="contained" onClick={handleOpen}>
            Add New Item
          </Button>
          <TextField
            variant="outlined"
            placeholder="Search pantry items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ style: { color: 'white' } }}
            InputLabelProps={{ style: { color: 'white' } }}
          />
          <FormControl variant="outlined" fullWidth>
            <InputLabel style={{ color: 'white' }}>Filter by Category</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              label="Filter by Category"
              style={{ color: 'white', borderColor: 'white' }}
            >
              <MenuItem value=""><em>All</em></MenuItem>
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Clothing">Clothing</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box flexGrow={1} border="1px solid #333" borderRadius={2} padding={2}>
          <Box
            width="100%"
            height="100px"
            bgcolor="#333"
            display="flex"
            justifyContent="center"
            alignItems="center"
            borderRadius={2}
          >
            <Typography variant="h4" color="#fff">
              Inventory Items
            </Typography>
          </Box>
          <Stack spacing={2} mt={2}>
            {filteredInventory.map(({ name, quantity, category, description, price, supplier }) => (
              <Box
                key={name}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bgcolor="#444"
                padding={2}
                borderRadius={2}
              >
                <Typography variant="h6" color="#fff">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body1" color="#fff">
                    {category}
                  </Typography>
                  <Typography variant="body1" color="#fff">
                    {description}
                  </Typography>
                  <Typography variant="body1" color="#fff">
                    ${typeof price === 'number' ? price.toFixed(2) : 'N/A'}
                  </Typography>
                  <Typography variant="body1" color="#fff">
                    {supplier}
                  </Typography>
                  <IconButton
                    color="primary"
                    onClick={() => addItem(name, 1, category, description, price, supplier)}
                  >
                    <Add />
                  </IconButton>
                  <Typography variant="h6" color="#fff">
                    {quantity}
                  </Typography>
                  <IconButton
                    color="primary"
                    onClick={() => removeItem(name)}
                  >
                    <Remove />
                  </IconButton>
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<Edit />}
                    onClick={() => handleEditOpen({ name, quantity, category, description, price, supplier })}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<Delete />}
                    onClick={() => deleteItem(name)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
